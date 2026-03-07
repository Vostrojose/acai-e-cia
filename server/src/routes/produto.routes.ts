import { Router } from 'express'
import produtoController from '../controllers/produto.controller'
import { ensureAuthenticated } from '../middlewares/auth.middleware'

const router = Router()

// 🔓 Público (client precisa listar produtos)
router.get('/produtos', produtoController.listar)

// 🔐 Apenas admin autenticado
router.post('/produtos', produtoController.criar)
router.patch('/produtos/:id/status', produtoController.alterarStatus)

export default router
