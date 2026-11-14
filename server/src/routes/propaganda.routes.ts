
import { Router } from 'express'
import propagandaController from '../controllers/propaganda.controller'
import { uploadPropaganda } from '../middlewares/upload.middleware'

const router = Router()

// Upload direto para o R2
router.post(
  '/upload-url',
  propagandaController.gerarUrlUpload,
)

router.post(
  '/confirmar-upload',
  propagandaController.confirmarUpload,
)

router.post(
  '/cancelar-upload',
  propagandaController.cancelarUpload,
)

// Consultas
router.get('/', propagandaController.listar)
router.get('/:id', propagandaController.buscarPorId)

// Operações de propaganda
router.post(
  '/upload',
  uploadPropaganda.single('arquivo'),
  propagandaController.upload,
)

router.post('/', propagandaController.criar)

router.put('/:id', propagandaController.atualizar)

router.delete('/:id', propagandaController.remover)

export default router
