
import { Router } from 'express'
import tvController from '../controllers/tv.controller'
import { ensureAuthenticated } from '../middlewares/auth.middleware'
import { ensureAdmin } from '../middlewares/ensureAdmin'

const router = Router()

// Consultas administrativas protegidas
router.get('/', ensureAuthenticated, ensureAdmin, tvController.listar)

router.get('/status', ensureAuthenticated, ensureAdmin, tvController.status)

// Consulta utilizada pelo aplicativo Android
router.get('/codigo/:codigo', tvController.buscarPorCodigo)

// Alteração administrativa protegida
router.put('/:id', ensureAuthenticated, ensureAdmin, tvController.atualizar)

// Comunicação utilizada pelo aplicativo Android
router.post('/registrar', tvController.registrar)

router.post('/heartbeat', tvController.heartbeat)

export default router
