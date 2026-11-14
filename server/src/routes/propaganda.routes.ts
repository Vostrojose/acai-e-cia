import { Router } from 'express'
import propagandaController from '../controllers/propaganda.controller'
import { uploadPropaganda } from '../middlewares/upload.middleware'
import { ensureAuthenticated } from '../middlewares/auth.middleware'
import { ensureAdmin } from '../middlewares/ensureAdmin'

const router = Router()
router.post(
  '/upload-url',
  ensureAuthenticated,
  ensureAdmin,
  propagandaController.gerarUrlUpload,
)

router.post(
  '/confirmar-upload',
  ensureAuthenticated,
  ensureAdmin,
  propagandaController.confirmarUpload,
)
router.post(
  '/cancelar-upload',
  ensureAuthenticated,
  ensureAdmin,
  propagandaController.cancelarUpload,
)

// Consultas públicas
router.get('/', propagandaController.listar)
router.get('/:id', propagandaController.buscarPorId)

// Operações administrativas protegidas
router.post(
  '/upload',
  ensureAuthenticated,
  ensureAdmin,
  uploadPropaganda.single('arquivo'),
  propagandaController.upload,
)

router.post('/', ensureAuthenticated, ensureAdmin, propagandaController.criar)

router.put(
  '/:id',
  ensureAuthenticated,
  ensureAdmin,
  propagandaController.atualizar,
)

router.delete(
  '/:id',
  ensureAuthenticated,
  ensureAdmin,
  propagandaController.remover,
)

export default router
