import { Request, Response } from 'express'
import propagandaService from '../services/propaganda.service'
import r2Service from '../services/r2.service'
import path from 'path'

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

      return res.status(500).json({
        success: false,
        error,
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
