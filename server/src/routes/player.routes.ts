import { Router } from 'express'
import playerController from '../controllers/player.controller'

const router = Router()

router.get(
  '/:codigo',
  playerController.obter,
)

export default router