import { Request, Response } from 'express'
import propagandaService from '../services/propaganda.service'
import r2Service from '../services/r2.service'
import path from 'path'
import { randomUUID } from 'crypto'

const LIMITE_UPLOAD = 1024 * 1024 * 1024

const TIPOS_PERMITIDOS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
  'video/mp4',
]

const EXTENSOES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
  'image/svg+xml': '.svg',
  'video/mp4': '.mp4',
}

class PropagandaController {
  async listar(_req: Request, res: Response) {
    try {
      const propagandas = await propagandaService.listar()

      return res.json({
        success: true,
        data: propagandas,
      })
    } catch (error) {
      console.error(error)

      return res.status(500).json({
        success: false,
        message: 'Erro ao listar propagandas',
      })
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const propaganda = await propagandaService.buscarPorId(req.params.id)

      if (!propaganda) {
        return res.status(404).json({
          success: false,
          message: 'Propaganda não encontrada',
        })
      }

      return res.json({
        success: true,
        data: propaganda,
      })
    } catch (error) {
      console.error(error)

      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar propaganda',
      })
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const propaganda = await propagandaService.criar(req.body)

      return res.status(201).json({
        success: true,
        data: propaganda,
      })
    } catch (error) {
      console.error('ERRO CRIAR PROPAGANDA:', error)

      const arquivo = req.body?.arquivo

      const arquivoDoNovoUpload =
        typeof arquivo === 'string' &&
        /^propagandas\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|gif|avif|svg|mp4)$/i.test(
          arquivo,
        )

      if (arquivoDoNovoUpload) {
        try {
          await r2Service.remover(arquivo)
          console.log('Arquivo órfão removido do R2:', arquivo)
        } catch (erroRemocao) {
          console.error('ERRO AO REMOVER ARQUIVO ÓRFÃO DO R2:', erroRemocao)
        }
      }

      return res.status(500).json({
        success: false,
        message: 'Erro ao criar propaganda',
      })
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const propaganda = await propagandaService.atualizar(
        req.params.id,
        req.body,
      )

      return res.json({
        success: true,
        data: propaganda,
      })
    } catch (error) {
      console.error(error)

      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar propaganda',
      })
    }
  }

  async remover(req: Request, res: Response) {
    try {
      await propagandaService.remover(req.params.id)

      return res.json({
        success: true,
        message: 'Propaganda removida',
      })
    } catch (error: any) {
      console.error(error)

      return res.status(400).json({
        success: false,
        message: error?.message ?? 'Erro ao remover propaganda',
      })
    }
  }

  async gerarUrlUpload(req: Request, res: Response) {
    try {
      const { contentType, tamanho } = req.body

      if (!TIPOS_PERMITIDOS.includes(contentType)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de arquivo não permitido',
        })
      }

      if (
        !Number.isSafeInteger(tamanho) ||
        tamanho <= 0 ||
        tamanho > LIMITE_UPLOAD
      ) {
        return res.status(400).json({
          success: false,
          message: 'Tamanho de arquivo inválido ou superior a 1 GiB',
        })
      }

      const extensao = EXTENSOES[contentType]
      const key = `propagandas/${randomUUID()}${extensao}`

      const urlUpload = await r2Service.gerarUrlUpload(key, contentType, 300)

      return res.json({
        success: true,
        urlUpload,
        arquivo: key,
        contentType,
        tamanho,
        expiresIn: 300,
      })
    } catch (error) {
      console.error('ERRO AO GERAR URL R2:', error)

      return res.status(500).json({
        success: false,
        message: 'Erro ao gerar autorização de upload',
      })
    }
  }

  async confirmarUpload(req: Request, res: Response) {
    try {
      const { arquivo, contentType, tamanho } = req.body

      const tiposValidos = TIPOS_PERMITIDOS.includes(contentType)

      const extensao = EXTENSOES[contentType]

      const chaveValida =
        typeof arquivo === 'string' &&
        arquivo.startsWith('propagandas/') &&
        new RegExp(`^propagandas/[0-9a-f-]{36}\\${extensao}$`, 'i').test(
          arquivo,
        )

      if (
        !tiposValidos ||
        !chaveValida ||
        !Number.isSafeInteger(tamanho) ||
        tamanho <= 0 ||
        tamanho > LIMITE_UPLOAD
      ) {
        return res.status(400).json({
          success: false,
          message: 'Dados de confirmação inválidos',
        })
      }

      const resultado = await r2Service.verificarUpload(arquivo)

      const tamanhoReal = resultado.tamanho
      const tipoReal = resultado.contentType

      if (
        tamanhoReal !== tamanho ||
        tamanhoReal === undefined ||
        tamanhoReal > LIMITE_UPLOAD ||
        tipoReal !== contentType
      ) {
        await r2Service.remover(arquivo)

        return res.status(400).json({
          success: false,
          message: 'Arquivo enviado não corresponde aos dados autorizados',
        })
      }

      return res.json({
        success: true,
        arquivo,
        tamanho: tamanhoReal,
        contentType: tipoReal,
        message: 'Upload confirmado com sucesso',
      })
    } catch (error) {
      console.error('ERRO AO CONFIRMAR UPLOAD R2:', error)

      return res.status(500).json({
        success: false,
        message: 'Erro ao confirmar arquivo no R2',
      })
    }
  }
  async cancelarUpload(req: Request, res: Response) {
    try {
      const { arquivo } = req.body

      const chaveValida =
        typeof arquivo === 'string' &&
        /^propagandas\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|gif|avif|svg|mp4)$/i.test(
          arquivo,
        )

      if (!chaveValida) {
        return res.status(400).json({
          success: false,
          message: 'Arquivo inválido para cancelamento',
        })
      }

      await r2Service.remover(arquivo)

      return res.json({
        success: true,
        message: 'Upload cancelado e arquivo removido',
      })
    } catch (error) {
      console.error('ERRO AO CANCELAR UPLOAD R2:', error)

      return res.status(500).json({
        success: false,
        message: 'Erro ao cancelar upload',
      })
    }
  }

  async upload(
    req: Request & {
      file?: any
    },
    res: Response,
  ) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum arquivo enviado',
        })
      }

      const extensao = path.extname(req.file.originalname)

      const nomeArquivo = `${Date.now()}${extensao}`

      const key = `propagandas/${nomeArquivo}`

      await r2Service.upload(req.file.path, key, req.file.mimetype)

      return res.json({
        success: true,
        arquivo: key,
      })
    } catch (error) {
      console.error(error)

      return res.status(500).json({
        success: false,
        message: 'Erro ao fazer upload',
      })
    }
  }
}

export default new PropagandaController()
