import { Router } from 'express'
import propagandaController from '../controllers/propaganda.controller'
import { uploadPropaganda } from '../middlewares/upload.middleware'

const router = Router()

router.get('/', propagandaController.listar)

router.post(
  '/upload',
  uploadPropaganda.single('arquivo'),
  propagandaController.upload,
)

router.get('/:id', propagandaController.buscarPorId)

router.post('/', propagandaController.criar)

router.put('/:id', propagandaController.atualizar)

router.delete('/:id', propagandaController.remover)

export default router
