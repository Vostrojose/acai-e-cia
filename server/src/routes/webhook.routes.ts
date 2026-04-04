import { Router } from 'express'
import WebhookController from '../controllers/WebhookController'

const router = Router()

// Rota para receber notificações do Mercado Pago
router.post('/api/pagamento/webhook', WebhookController.pagamento)

export default router

