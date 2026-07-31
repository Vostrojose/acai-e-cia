import { Request, Response } from 'express'
import tvService from '../services/tv.service'

class TVController {
  async listar(_req: Request, res: Response) {
    try {
      const tvs = await tvService.listar()

      return res.json({
        success: true,
        data: tvs,
      })
    } catch (error) {
      console.error(error)

      return res.status(500).json({
        success: false,
        message: 'Erro ao listar TVs',
      })
    }
  }

  async buscarPorCodigo(req: Request, res: Response) {
    try {
      const { codigo } = req.params

      const tv = await tvService.buscarPorCodigo(codigo)

      return res.json({
        success: true,
        existe: !!tv,
        data: tv,
      })
    } catch (error) {
      console.error(error)

      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar TV',
      })
    }
  }

  async registrar(_req: Request, res: Response) {
    try {
      const tv = await tvService.registrar()

      return res.status(201).json({
        success: true,
        data: {
          codigo: tv.codigo,
        },
      })
    } catch (error) {
      console.error(error)

      return res.status(500).json({
        success: false,
        message: 'Erro ao registrar TV',
      })
    }
  }

async heartbeat(req: Request, res: Response) {

  console.log("===== HEARTBEAT =====")
console.log(req.body)
  try {
    const dados = req.body

    if (!dados.codigo) {
      return res.status(400).json({
        success: false,
        message: 'Código não informado',
      })
    }

    const tv = await tvService.heartbeat(dados)

    if (!tv) {
      return res.status(404).json({
        success: false,
        message: 'TV não encontrada',
      })
    }

    return res.json({
      success: true,
      data: tv,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      message: 'Erro ao registrar heartbeat',
    })
  }
}
  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params

      const { nome, codigo, playlistId } = req.body

      const tv = await tvService.atualizar(id, {
        nome,
        codigo,
        playlistId,
      })

      return res.json({
        success: true,
        data: tv,
      })
    } catch (error) {
      console.error(error)

      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar TV',
      })
    }
  }

  async status(_req: Request, res: Response) {
    try {
      const dados = await tvService.status()

      return res.json({
        success: true,
        data: dados,
      })
    } catch (error) {
      console.error(error)

      return res.status(500).json({
        success: false,
        message: 'Erro ao obter status',
      })
    }
  }
}

export default new TVController()
