import { Request, Response } from 'express'
import { MercadoPagoProvider } from '../services/payment/providers/mercadoPago.provider'
import pedidoService from '../services/pedido.service'
import { StatusPagamento } from '@prisma/client'
import { getIO } from '../websocket/socket'
import { serializeDecimal } from '../utils/serializeDecimal'
import securityLogService from '../services/securityLog.service'

const mpProvider = new MercadoPagoProvider()

// Definimos uma interface para o objeto pagamento
interface Pagamento {
  id?: string
  status?: string

  external_reference?: string
  externalReference?: string
}

export class WebhookController {
  async pagamento(req: Request, res: Response) {
    try {
      console.log('📥 [WEBHOOK] Notificação recebida:', req.body)

      const paymentId = req.body?.data?.id
      if (!paymentId) {
        console.error('❌ [WEBHOOK] Nenhum paymentId encontrado')
        return res.status(400).send('paymentId ausente')
      }

      // Buscar detalhes do pagamento no Mercado Pago
      const pagamento: Pagamento = await mpProvider.buscarPagamento(paymentId)

      console.log('📊 [WEBHOOK] Pagamento consultado:', pagamento)

      /* ============================= */
      /* 🔥 NORMALIZA EXTERNAL REF     */
      /* ============================= */

      const externalReference =
        pagamento.external_reference || pagamento.externalReference

      if (!externalReference) {
        console.error('❌ [WEBHOOK] externalReference ausente no pagamento')
        return res.status(400).send('externalReference ausente')
      }

      // Mapear status do Mercado Pago para StatusPagamento
      let novoStatusPagamento: StatusPagamento = StatusPagamento.PENDENTE

      if (pagamento.status === 'approved') {
        novoStatusPagamento = StatusPagamento.APROVADO
      }

      if (pagamento.status === 'rejected') {
        novoStatusPagamento = StatusPagamento.RECUSADO
      }

      if (pagamento.status === 'pending') {
        novoStatusPagamento = StatusPagamento.PENDENTE
      }

      // Atualizar pedido no banco usando externalReference
      const pedidoAtualizado = await pedidoService.atualizarPagamento(
        externalReference,
        novoStatusPagamento,
        pagamento.id,
      )
      await securityLogService.registrar({
        tipo: 'PAGAMENTO',
        acao: 'WEBHOOK_MP',

        entidade: 'Pedido',
        entidadeId: externalReference,

        detalhes: {
          pagamentoId: pagamento.id,
          status: pagamento.status,
        },
      })

      // 🔔 Emitir atualização via websocket
      getIO().emit('pedido_atualizado', serializeDecimal(pedidoAtualizado))

      console.log(
        `✅ Pedido ${externalReference} atualizado para pagamento ${novoStatusPagamento}`,
      )

      return res
        .status(200)
        .json({ success: true, data: serializeDecimal(pedidoAtualizado) })
    } catch (error: any) {
      console.error('❌ [WEBHOOK] Erro ao processar webhook:', error.message)
      return res.status(500).send('Erro interno')
    }
  }
}

export default new WebhookController()
