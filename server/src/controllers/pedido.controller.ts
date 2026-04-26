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

  criar: RequestHandler = asyncHandler(async (req, res) => {

    const parsed = criarPedidoSchema.parse(req.body)

    const pedidoCompleto = await pedidoService.criarPedido({
      ...parsed,
      endereco: parsed.endereco ?? ''
    })

    // ❌ REMOVIDO: não emitir socket aqui
    // O pedido ainda está aguardando pagamento

    return res.status(201).json({
      success: true,
      data: serializeDecimal(pedidoCompleto),
    })
  })

  listar: RequestHandler = asyncHandler(async (req, res) => {
    const status = req.query.status as string | undefined
    const pedidos = await pedidoService.listarPedidos(status)

    return res.json({
      success: true,
      data: serializeDecimal(pedidos),
    })
  })

  buscarPorId: RequestHandler = asyncHandler(async (req, res) => {
    const { id } = req.params

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
  })

  atualizarStatus: RequestHandler = asyncHandler(async (req, res) => {

    const { id } = req.params
    const data = atualizarStatusSchema.parse(req.body)

    await pedidoService.atualizarStatus(id, data.status as StatusPedido)

    const pedidoCompleto = await pedidoService.buscarPorId(id)
    const serializado = serializeDecimal(pedidoCompleto)

    try {
      getIO().emit('pedido_atualizado', serializado)
    } catch {
      console.warn('WebSocket não iniciado')
    }

    if (pedidoCompleto?.status === StatusPedido.PRONTO && pedidoCompleto.telefone) {
      try {
        await NotificationService.enviarMensagem(
          pedidoCompleto.telefone,
          ' Seu pedido está PRONTO!'
        )
      } catch {
        console.warn('Erro ao enviar notificação')
      }
    }

    return res.json({
      success: true,
      data: serializado,
    })
  })

  dashboard: RequestHandler = asyncHandler(async (_req, res) => {
    const data = await pedidoService.listarPedidos()

    return res.json({
      success: true,
      data: serializeDecimal(data),
    })
  })
}

export default new PedidoController()