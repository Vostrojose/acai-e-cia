import { Request, Response, RequestHandler } from 'express'
import { StatusPedido } from '@prisma/client'
import pedidoService from '../services/pedido.service'
import { asyncHandler } from '../utils/asyncHandler'
import { atualizarStatusSchema } from '../validators/pedido-status.schema'
import { criarPedidoSchema } from '../validators/pedido.schema'
import { getIO } from '../websocket/socket'
import { NotificationService } from '../services/notification'
import { serializeDecimal } from '../utils/serializeDecimal'

class PedidoController {

  criar: RequestHandler = asyncHandler(
    async (req, res) => {
      const parsed = criarPedidoSchema.parse(req.body)

      const pedido = await pedidoService.criarPedido({
        ...parsed,
        endereco: parsed.endereco ?? ''
      })

      return res.status(201).json({
        success: true,
        data: serializeDecimal(pedido),
      })
    }
  )

  listar: RequestHandler = asyncHandler(
    async (req, res) => {
      const status = req.query.status as string | undefined

      const pedidos = await pedidoService.listarPedidos(status)

      return res.json({
        success: true,
        data: serializeDecimal(pedidos),
      })
    }
  )

  atualizarStatus: RequestHandler = asyncHandler(
    async (req, res) => {
      const { id } = req.params
      const data = atualizarStatusSchema.parse(req.body)

      const pedido = await pedidoService.atualizarStatus(
        id,
        data.status as StatusPedido
      )

      const serializado = serializeDecimal(pedido)

      try {
        getIO().emit('pedido_atualizado', serializado)
      } catch {
        console.warn('WebSocket não iniciado')
      }

      if (pedido.status === StatusPedido.PRONTO && pedido.telefone) {
        try {
          await NotificationService.enviarMensagem(
            pedido.telefone,
            '🍧 Seu pedido está PRONTO!'
          )
        } catch {}
      }

      return res.json({
        success: true,
        data: serializado,
      })
    }
  )

  dashboard: RequestHandler = asyncHandler(
    async (_req, res) => {
      const data = await pedidoService.dashboardPedidos()

      return res.json({
        success: true,
        data: serializeDecimal(data),
      })
    }
  )
}

export default new PedidoController()