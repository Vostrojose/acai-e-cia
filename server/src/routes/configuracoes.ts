import { Router } from 'express'

import {
  obterBannerAcompanhamento,
  atualizarBannerAcompanhamento,
  obterPedidosOnline,
  atualizarPedidosOnline,
} from '../controllers/configuracoesController'

const router = Router()

router.get('/banner-acompanhamento', obterBannerAcompanhamento)

router.put('/banner-acompanhamento', atualizarBannerAcompanhamento)

router.get('/pedidos-online', obterPedidosOnline)

router.put('/pedidos-online', atualizarPedidosOnline)

export default router
