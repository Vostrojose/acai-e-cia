import { Router } from 'express'
import pedidoController from '../controllers/pedido.controller'

const router = Router()

router.post('/pedido', pedidoController.criar)
router.get('/pedidos', pedidoController.listar)
router.patch('/pedido/:id/status', pedidoController.atualizarStatus)
router.get('/dashboard/pedidos', pedidoController.dashboard)

export default router

