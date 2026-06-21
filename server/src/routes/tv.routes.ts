import { Router } from 'express'
import tvController from '../controllers/tv.controller'

const router = Router()

router.get('/', tvController.listar)

router.get('/status', tvController.status)

router.post('/heartbeat', tvController.heartbeat)

router.post('/registrar', tvController.registrar)

router.get('/:id', tvController.buscarPorId)

router.post('/', tvController.criar)

router.put('/:id', tvController.atualizar)

router.delete('/:id', tvController.remover)

export default router
