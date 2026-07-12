import { Request, Response } from 'express'
import tvService from '../services/tv.service'

class TVController {
  async heartbeat(req: Request, res: Response) {
    console.log('=================================')
    console.log('HEARTBEAT RECEBIDO')
    console.log('Headers:', req.headers)
    console.log('Body:', req.body)
    console.log('Body JSON:', JSON.stringify(req.body))
    console.log('=================================')

    try {
      const { codigo } = req.body

      if (!codigo) {
        return res.status(400).json({
          success: false,
          message: 'Código não recebido',
        })
      }

      const resultado = await tvService.heartbeat(codigo)

      return res.json({
        success: true,
        data: resultado,
      })
    } catch (error) {
      console.error(error)

      return res.status(500).json({
        success: false,
        message: 'Erro ao registrar heartbeat',
      })
    }
  }
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

  async buscarPorId(req: Request, res: Response) {
    try {
      const tv = await tvService.buscarPorId(req.params.id)

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
        message: 'Erro ao buscar TV',
      })
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const { nome, codigo, playlistId } = req.body

      const tv = await tvService.criar(nome, codigo, playlistId)

      return res.status(201).json({
        success: true,
        data: tv,
      })
    } catch (error) {
      console.error(error)

      return res.status(500).json({
        success: false,
        message: 'Erro ao criar TV',
      })
    }
  }
  async buscarPorCodigo(req: Request, res: Response) {
    try {
      const { codigo } = req.params

      const tv = await tvService.buscarPorCodigo(codigo)

      return res.json({
        success: true,
        existe: Boolean(tv),
        data: tv,
      })
    } catch (error) {
      console.error(error)

      return res.status(500).json({
        success: false,
        message: 'Erro ao verificar TV',
      })
    }
  }
  async atualizar(req: Request, res: Response) {
    try {
      const { nome, codigo, playlistId } = req.body

      const tv = await tvService.atualizar(
        req.params.id,
        nome,
        codigo,
        playlistId,
      )

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

  async remover(req: Request, res: Response) {
    try {
      await tvService.remover(req.params.id)

      return res.json({
        success: true,
        message: 'TV removida',
      })
    } catch (error) {
      console.error(error)

      return res.status(500).json({
        success: false,
        message: 'Erro ao remover TV',
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
        message: 'Erro ao obter status das TVs',
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
}

export default new TVController()
