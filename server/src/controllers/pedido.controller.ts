import { RequestHandler } from 'express'
import { StatusPedido } from '@prisma/client'
import pedidoService from '../services/pedido.service'
import { asyncHandler } from '../utils/asyncHandler'
import { atualizarStatusSchema } from '../validators/pedido-status.schema'
import { criarPedidoSchema } from '../validators/pedido.schema'
import { getIO } from '../websocket/socket'
import { NotificationService } from '../services/notification'
import { serializeDecimal } from '../utils/serializeDecimal'

class PedidoController {

  /* ============================= */
  /* CRIAR                         */
  /* ============================= */
criar: RequestHandler = asyncHandler(
  async (req, res) => {
    const parsed = criarPedidoSchema.parse(req.body)

    const pedido = await pedidoService.criarPedido({
      ...parsed,
      endereco: parsed.endereco ?? ''
    })

    /* 🔥 BUSCAR PEDIDO COMPLETO */
    const pedidoCompleto = await pedidoService.buscarPorId(pedido.id)

    /* 🔥 EMITIR SOCKET COM DADOS COMPLETOS */
    try {
      getIO().emit('novo_pedido', pedidoCompleto)
    } catch {
      console.warn('WebSocket não iniciado')
    }

    return res.status(201).json({
      success: true,
      data: serializeDecimal(pedidoCompleto),
    })
  }
)
  /* ============================= */
  /* LISTAR                        */
  /* ============================= */
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

  /* ============================= */
  /* BUSCAR POR ID                 */
  /* ============================= */
  buscarPorId: RequestHandler = asyncHandler(
    async (req, res) => {
      const { id } = req.params

      // 🔥 CORREÇÃO: usar função que já existe
      const pedido = await pedidoService.buscarPorId(id)

      if (!pedido) {
        return res.status(404).json({
          success: false,
          message: 'Pedido não encontrado',
        })
      }

      return res.json({
        success: true,
        data: serializeDecimal(pedido),
      })
    }
  )

  /* ============================= */
  /* ATUALIZAR STATUS              */
  /* ============================= */
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
        } catch {
          console.warn('Erro ao enviar notificação')
        }
      }

      return res.json({
        success: true,
        data: serializado,
      })
    }
  )

  /* ============================= */
  /* DASHBOARD                     */
  /* ============================= */
  dashboard: RequestHandler = asyncHandler(
    async (_req, res) => {

      // 🔥 CORREÇÃO: usar função que já existe
      const data = await pedidoService.listarPedidos()

      return res.json({
        success: true,
        data: serializeDecimal(data),
      })
    }
  )
}

export default new PedidoController()