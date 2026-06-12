import { Request, Response } from 'express'
import playlistItemService from '../services/playlist-item.service'

class PlaylistItemController {
  async listar(req: Request, res: Response) {
    const { playlistId } = req.params

    const itens =
      await playlistItemService.listar(playlistId)

    return res.json({
      success: true,
      data: itens,
    })
  }

  async adicionar(req: Request, res: Response) {
    const { playlistId } = req.params
    const { propagandaId } = req.body

    const item =
      await playlistItemService.adicionar(
        playlistId,
        propagandaId,
      )

    return res.status(201).json({
      success: true,
      data: item,
    })
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

    const resultado =
      await playlistItemService.reordenar(
        playlistId,
        itens,
      )

    return res.json({
      success: true,
      data: resultado,
    })
  }
}

export default new PlaylistItemController()