import { Router } from 'express'
import balcaoController from '../controllers/balcao.controller'

const router = Router()

/* =================================
   💰 VENDA BALCÃO
================================= */

router.post('/', balcaoController.criar)

router.get('/pendentes', balcaoController.listarPendentes)

router.patch('/quitar/:id', balcaoController.quitar)

export default router
