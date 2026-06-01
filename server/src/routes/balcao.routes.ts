import { Router } from 'express'
import balcaoController from '../controllers/balcao.controller'
import { ensureAuthenticated } from '../middlewares/auth.middleware'

const router = Router()

/* =================================
   💰 VENDA BALCÃO
================================= */

router.post('/', balcaoController.criar)

router.get('/pendentes', balcaoController.listarPendentes)

router.patch(
  '/:id/cancelar',
  ensureAuthenticated,
  balcaoController.cancelar,
)

router.patch('/quitar/:id', balcaoController.quitar)

export default router
