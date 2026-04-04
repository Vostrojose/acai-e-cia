import { Request, Response, RequestHandler } from 'express'
import { StatusPedido } from '@prisma/client'
import pedidoService from '../services/pedido.service'
import { asyncHandler } from '../utils/asyncHandler'
import { atualizarStatusSchema } from '../validators/pedido-status.schema'
import { criarPedidoSchema } from '../validators/pedido.schema'
import { getIO } from '../websocket/socket'
import { NotificationService } from '../services/notification'

class PedidoController {

  /* ============================= */
  /* CRIAR */
  /* ============================= */

  criar: RequestHandler = asyncHandler(
    async (request: Request, response: Response) => {
      const parsed = criarPedidoSchema.parse(request.body)

      // 🔥 CORREÇÃO AQUI
      const data = {
        ...parsed,
        endereco: parsed.endereco ?? ''
      }

      const pedido = await pedidoService.criarPedido(data)

      return response.status(201).json({
        success: true,
        data: pedido,
      })
    }
  )

  /* ============================= */
  /* LISTAR */
  /* ============================= */

  listar: RequestHandler = asyncHandler(
    async (request: Request, response: Response) => {
      const { status } = request.query

      const pedidos = await pedidoService.listarPedidos(
        status as string | undefined
      )

      return response.json({
        success: true,
        data: pedidos,
      })
    }
  )

  /* ============================= */
  /* ATUALIZAR STATUS */
  /* ============================= */

  atualizarStatus: RequestHandler = asyncHandler(
    async (request: Request, response: Response) => {
      const { id } = request.params
      const data = atualizarStatusSchema.parse(request.body)

      const pedido = await pedidoService.atualizarStatus(
        id,
        data.status as StatusPedido
      )

      // 🔔 Atualização em tempo real
      getIO().emit('pedido_atualizado', pedido)

      // 📲 Notificação quando estiver PRONTO
      if (pedido.status === StatusPedido.PRONTO && pedido.telefone) {
        await NotificationService.enviarMensagem(
          pedido.telefone,
          '🍧 Seu pedido está PRONTO para retirada!'
        )
      }

      return response.json({
        success: true,
        data: pedido,
      })
    }
  )

  /* ============================= */
  /* DASHBOARD */
  /* ============================= */

  dashboard: RequestHandler = asyncHandler(
    async (_request: Request, response: Response) => {
      const data = await pedidoService.dashboardPedidos()

      return response.json({
        success: true,
        data,
      })
    }
  )
}

export default new PedidoController()
