import { Request, Response } from 'express'
import playlistItemService from '../services/playlist-item.service'

class PlaylistItemController {
  async listar(req: Request, res: Response) {
    const { playlistId } = req.params

    const itens = await playlistItemService.listar(playlistId)

    return res.json({
      success: true,
      data: itens,
    })
  }

  async adicionar(req: Request, res: Response) {
    try {
      const { playlistId } = req.params
      const { propagandaId } = req.body

      const item = await playlistItemService.adicionar(playlistId, propagandaId)

      return res.status(201).json({
        success: true,
        data: item,
      })
    } catch (error) {
      console.error(error)

      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Erro ao adicionar propaganda.',
      })
    }
  }
  async remover(req: Request, res: Response) {
    const { itemId } = req.params

    await playlistItemService.remover(itemId)

    return res.json({
      success: true,
      message: 'Item removido',
    })
  }

  async reordenar(req: Request, res: Response) {
    const { playlistId } = req.params
    const { itens } = req.body

    const resultado = await playlistItemService.reordenar(playlistId, itens)

    return res.json({
      success: true,
      data: resultado,
    })
  }
}

export default new PlaylistItemController()
