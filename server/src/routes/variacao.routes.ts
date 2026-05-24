import { Router } from 'express'
import { VariacaoController } from '../controllers/variacao.controller'

const router = Router()
const controller = new VariacaoController()

router.get('/produto/:produtoId', controller.listar)

router.post('/', controller.criar)

router.put('/:id', controller.atualizar)

router.patch('/:id/status', controller.alterarStatus)

router.delete('/:id', controller.remover)

export default router