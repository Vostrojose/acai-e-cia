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
    const agora = new Date()

    const partes = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(agora)

    const diaTexto = partes.find((p) => p.type === 'weekday')?.value
    const hora = Number(partes.find((p) => p.type === 'hour')?.value ?? 0)
    const minuto = Number(partes.find((p) => p.type === 'minute')?.value ?? 0)

    const diasSemana: Record<string, number> = {
      dom: 0,
      seg: 1,
      ter: 2,
      qua: 3,
      qui: 4,
      sex: 5,
      sáb: 6,
      sab: 6,
    }

    const diaSemana = diasSemana[diaTexto ?? ''] ?? 0
    const horaAtual = hora * 60 + minuto

    let abertura = 0

    if (diaSemana >= 1 && diaSemana <= 5) {
      // Segunda a sexta: 08:00
      abertura = 8 * 60
    } else if (diaSemana === 6) {
      // Sábado: 10:00
      abertura = 10 * 60
    }

    const fechamento = 18 * 60 + 30 // 18:30

    const lojaFechada =
      diaSemana === 0 || horaAtual < abertura || horaAtual >= fechamento

    if (lojaFechada) {
      return res.status(403).json({
        success: false,
        message:
          diaSemana === 0
            ? 'Pedidos não são aceitos aos domingos.'
            : diaSemana === 6 && horaAtual < abertura
              ? 'Os pedidos de sábado são aceitos a partir das 10:00.'
              : horaAtual < abertura
                ? 'Os pedidos são aceitos a partir das 08:00.'
                : 'Os pedidos foram encerrados por hoje. Retornaremos no próximo horário de funcionamento.',
      })
    }

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

    return res.status(201).json({
      success: true,
      data: serializeDecimal(pedidoCompleto),
      foraDaArea,
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
