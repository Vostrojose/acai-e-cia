import { Router } from 'express'

import {
  obterBannerAcompanhamento,
  atualizarBannerAcompanhamento,
} from '../controllers/configuracoesController'

const router = Router()

router.get(
  '/banner-acompanhamento',
  obterBannerAcompanhamento,
)

router.put(
  '/banner-acompanhamento',
  atualizarBannerAcompanhamento,
)

export default router