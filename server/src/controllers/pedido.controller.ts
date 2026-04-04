import { Request, Response, RequestHandler } from 'express'
import { StatusPedido } from '@prisma/client'
import pedidoService from '../services/pedido.service'
import { asyncHandler } from '../utils/asyncHandler'
import { atualizarStatusSchema } from '../validators/pedido-status.schema'
import { criarPedidoSchema } from '../validators/pedido.schema'
import { getIO } from '../websocket/socket'
import { NotificationService } from '../services/notification'
import { serializeDecimal } from '../utils/serializeDecimal' // ✅ NOVO

class PedidoController {

  criar: RequestHandler = asyncHandler(
    async (request: Request, response: Response) => {
      const parsed = criarPedidoSchema.parse(request.body)

      const data = {
        ...parsed,
        endereco: parsed.endereco ?? ''
      }

      const pedido = await pedidoService.criarPedido(data)

      return response.status(201).json({
        success: true,
        data: serializeDecimal(pedido), // ✅ CORREÇÃO
      })
    }
  )

  listar: RequestHandler = asyncHandler(
    async (request: Request, response: Response) => {
      const { status } = request.query

      const pedidos = await pedidoService.listarPedidos(
        status as string | undefined
      )

      return response.json({
        success: true,
        data: serializeDecimal(pedidos), // ✅ CORREÇÃO
      })
    }
  )

  atualizarStatus: RequestHandler = asyncHandler(
    async (request: Request, response: Response) => {
      const { id } = request.params
      const data = atualizarStatusSchema.parse(request.body)

      const pedido = await pedidoService.atualizarStatus(
        id,
        data.status as StatusPedido
      )

      // 🔔 socket (mantém original)
      getIO().emit('pedido_atualizado', serializeDecimal(pedido)) // ✅ CORREÇÃO

      if (pedido.status === StatusPedido.PRONTO && pedido.telefone) {
        await NotificationService.enviarMensagem(
          pedido.telefone,
          '🍧 Seu pedido está PRONTO para retirada!'
        )
      }

      return response.json({
        success: true,
        data: serializeDecimal(pedido), // ✅ CORREÇÃO
      })
    }
  )

  dashboard: RequestHandler = asyncHandler(
    async (_request: Request, response: Response) => {
      const data = await pedidoService.dashboardPedidos()

      return response.json({
        success: true,
        data: serializeDecimal(data), // ✅ CORREÇÃO
      })
    }
  )
}

export default new PedidoController()
