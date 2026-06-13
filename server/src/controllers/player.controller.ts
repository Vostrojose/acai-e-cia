import { Request, Response } from 'express'
import playerService from '../services/player.service'

class PlayerController {
  async obter(req: Request, res: Response) {
    try {
      const { codigo } = req.params

      const resultado =
        await playerService.obterPlaylistDaTV(codigo)

      return res.json({
        success: true,
        data: resultado,
      })
    } catch (error: any) {
      console.error(error)

      return res.status(400).json({
        success: false,
        message: error.message,
      })
    }
  }
}

export default new PlayerController()