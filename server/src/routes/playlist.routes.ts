import { Router } from 'express'
import playlistController from '../controllers/playlist.controller'

const router = Router()

router.get('/', playlistController.listar)

router.get('/:id', playlistController.buscarPorId)

router.post('/', playlistController.criar)

router.put('/:id', playlistController.atualizar)

router.delete('/:id', playlistController.remover)

export default router
