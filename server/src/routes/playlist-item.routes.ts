import { Router } from 'express'
import playlistItemController from '../controllers/playlist-item.controller'

const router = Router()

router.get(
  '/:playlistId/itens',
  playlistItemController.listar,
)

router.post(
  '/:playlistId/itens',
  playlistItemController.adicionar,
)

router.delete(
  '/:playlistId/itens/:itemId',
  playlistItemController.remover,
)

router.put(
  '/:playlistId/reordenar',
  playlistItemController.reordenar,
)

export default router