import { Router } from 'express'
import playlistItemController from '../controllers/playlist-item.controller'
import { ensureAuthenticated } from '../middlewares/auth.middleware'
import { ensureAdmin } from '../middlewares/ensureAdmin'

const router = Router()

// Consulta pública para o player e as telas administrativas
router.get('/:playlistId/itens', playlistItemController.listar)

// Operações administrativas protegidas
router.post(
  '/:playlistId/itens',
  ensureAuthenticated,
  ensureAdmin,
  playlistItemController.adicionar,
)

router.delete(
  '/:playlistId/itens/:itemId',
  ensureAuthenticated,
  ensureAdmin,
  playlistItemController.remover,
)

router.put(
  '/:playlistId/reordenar',
  ensureAuthenticated,
  ensureAdmin,
  playlistItemController.reordenar,
)

export default router
