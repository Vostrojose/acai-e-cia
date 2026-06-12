import { Request, Response } from 'express'
import playlistService from '../services/playlist.service'

class PlaylistController {
  async listar(_req: Request, res: Response) {
    try {
      const playlists = await playlistService.listar()

      return res.json({
        success: true,
        data: playlists,
      })
    } catch (error) {
      console.error(error)

      return res.status(500).json({
        success: false,
        message: 'Erro ao listar playlists',
      })
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const playlist = await playlistService.buscarPorId(
        req.params.id,
      )

      if (!playlist) {
        return res.status(404).json({
          success: false,
          message: 'Playlist não encontrada',
        })
      }

      return res.json({
        success: true,
        data: playlist,
      })
    } catch (error) {
      console.error(error)

      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar playlist',
      })
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const { nome } = req.body

      const playlist = await playlistService.criar(nome)

      return res.status(201).json({
        success: true,
        data: playlist,
      })
    } catch (error) {
      console.error(error)

      return res.status(500).json({
        success: false,
        message: 'Erro ao criar playlist',
      })
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const { nome } = req.body

      const playlist = await playlistService.atualizar(
        req.params.id,
        nome,
      )

      return res.json({
        success: true,
        data: playlist,
      })
    } catch (error) {
      console.error(error)

      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar playlist',
      })
    }
  }

  async remover(req: Request, res: Response) {
    try {
      await playlistService.remover(req.params.id)

      return res.json({
        success: true,
        message: 'Playlist removida',
      })
    } catch (error) {
      console.error(error)

      return res.status(500).json({
        success: false,
        message: 'Erro ao remover playlist',
      })
    }
  }
}

export default new PlaylistController()