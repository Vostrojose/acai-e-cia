import { Router } from 'express'
import playlistController from '../controllers/playlist.controller'
import { ensureAuthenticated } from '../middlewares/auth.middleware'
import { ensureAdmin } from '../middlewares/ensureAdmin'

const router = Router()

// Consulta pública
router.get('/', playlistController.listar)
router.get('/:id', playlistController.buscarPorId)

// Operações administrativas protegidas
router.post('/', ensureAuthenticated, ensureAdmin, playlistController.criar)

router.put(
  '/:id',
  ensureAuthenticated,
  ensureAdmin,
  playlistController.atualizar,
)

router.delete(
  '/:id',
  ensureAuthenticated,
  ensureAdmin,
  playlistController.remover,
)

export default router
