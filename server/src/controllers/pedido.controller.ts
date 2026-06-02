import { RequestHandler } from 'express'
import { StatusPedido } from '@prisma/client'
import pedidoService from '../services/pedido.service'
import { asyncHandler } from '../utils/asyncHandler'
import { atualizarStatusSchema } from '../validators/pedido-status.schema'
import { criarPedidoSchema } from '../validators/pedido.schema'
import { getIO } from '../websocket/socket'
import { NotificationService } from '../services/notification'
import { serializeDecimal } from '../utils/serializeDecimal'
import securityLogService from '../services/securityLog.service'

const LOJA = {
  lat: -23.3292963,
  lng: -46.7277476,
}

function calcularDistancia(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) {
  const R = 6371 // km

  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c * 1000 // metros
}

class PedidoController {
  criar: RequestHandler = asyncHandler(async (req, res) => {
    const parsed = criarPedidoSchema.parse(req.body)

    /* ============================= */
    /* 🔥 NOVO: VALIDAÇÃO DE DISTÂNCIA */
    /* ============================= */

    let foraDaArea = false

    const coordenadas = (req.body as any)?.coordenadas

    if (coordenadas && coordenadas.lat && coordenadas.lng) {
      const distancia = calcularDistancia(
        LOJA.lat,
        LOJA.lng,
        coordenadas.lat,
        coordenadas.lng,
      )

      console.log('📏 DISTÂNCIA CLIENTE:', distancia)

      if (distancia > 300) {
        foraDaArea = true
      }
    }

    /* ============================= */
    /* FLUXO ORIGINAL (INALTERADO)   */
    /* ============================= */

    const pedidoCompleto = await pedidoService.criarPedido({
      ...parsed,
      endereco: parsed.endereco ?? '',
    })

    // ❌ continua sem socket (correto)
    // pedido ainda aguarda pagamento

    return res.status(201).json({
      success: true,
      data: serializeDecimal(pedidoCompleto),
      foraDaArea, // 🔥 NOVO (não quebra nada existente)
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
    const pedidoAtual = await pedidoService.buscarPorId(id)

    if (!pedidoAtual) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado',
      })
    }

    if (
      pedidoAtual.status === StatusPedido.CANCELADO &&
      data.status !== StatusPedido.CANCELADO
    ) {
      return res.status(409).json({
        success: false,
        message: 'Pedido cancelado não pode ser alterado',
      })
    }

    await pedidoService.atualizarStatus(id, data.status as StatusPedido)
    if (data.status === 'CANCELADO') {
      await securityLogService.registrar({
        tipo: 'PEDIDO',
        acao: 'CANCELAMENTO',

        entidade: 'Pedido',
        entidadeId: id,
      })
    }

    await securityLogService.registrar({
      tipo: 'PEDIDO',
      acao: 'ALTEROU_STATUS',

      entidade: 'Pedido',
      entidadeId: id,

      detalhes: {
        status: data.status,
      },
    })

    const pedidoCompleto = await pedidoService.buscarPorId(id)
    const serializado = serializeDecimal(pedidoCompleto)

    try {
      getIO().emit('pedido_atualizado', serializado)
    } catch {
      console.warn('WebSocket não iniciado')
    }

    if (
      pedidoCompleto?.status === StatusPedido.PRONTO &&
      pedidoCompleto.telefone
    ) {
      try {
        await NotificationService.enviarMensagem(
          pedidoCompleto.telefone,
          ' Seu pedido está PRONTO!',
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
