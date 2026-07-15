import { Router } from 'express'
import tvController from '../controllers/tv.controller'

const router = Router()

router.get('/', tvController.listar)

router.get('/status', tvController.status)

router.get('/codigo/:codigo', tvController.buscarPorCodigo)

router.put('/:id', tvController.atualizar)

router.post('/registrar', tvController.registrar)

router.post('/heartbeat', tvController.heartbeat)

export default router