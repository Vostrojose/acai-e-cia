import { Router } from 'express'
import { AdicionalController } from '../controllers/adicional.controller'


const router = Router()
const controller = new AdicionalController()

router.post('/', controller.criar)
router.delete('/:id', controller.remover)
router.put('/:id', controller.atualizar)
router.patch('/:id', controller.alterarStatus)

export default router