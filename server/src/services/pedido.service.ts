import prisma from '../lib/prisma'
import { StatusPedido } from '@prisma/client'
import { AppError } from '../utils/AppError'
import { getIO } from '../websocket/socket'

class PedidoService {
  /* ============================= */
  /* CRIAR PEDIDO (BLINDADO) */
  /* ============================= */

  async criarPedido(data: {
    itens: {
      produtoId: string
      quantidade: number
    }[]
    telefone?: string
  }) {
    if (!data.itens || data.itens.length === 0) {
      throw new AppError('Pedido precisa conter ao menos um item.', 400)
    }

    const produtosIds = data.itens.map((item) => item.produtoId)

    const produtos = await prisma.produto.findMany({
      where: {
        id: { in: produtosIds },
        ativo: true,
      },
    })

    if (produtos.length !== produtosIds.length) {
      throw new AppError(
        'Um ou mais produtos são inválidos ou estão inativos.',
        400
      )
    }

    const produtosMap = new Map(produtos.map((p) => [p.id, p]))

    let totalCalculado = 0

    const itensParaCriar = data.itens.map((item) => {
      if (!Number.isInteger(item.quantidade) || item.quantidade <= 0) {
        throw new AppError('Quantidade inválida.', 400)
      }

      const produto = produtosMap.get(item.produtoId)

      if (!produto) {
        throw new AppError('Produto não encontrado.', 400)
      }

      const subtotal = produto.preco * item.quantidade
      totalCalculado += subtotal

      return {
        produtoId: produto.id,
        quantidade: item.quantidade,
        precoUnit: produto.preco,
      }
    })

    const pedidoCriado = await prisma.$transaction(async (tx) => {
      return tx.pedido.create({
        data: {
          total: totalCalculado,
          telefone: data.telefone,
          itens: {
            create: itensParaCriar,
          },
        },
        include: {
          itens: true,
        },
      })
    })

    try {
      const io = getIO()
      io.emit('novo_pedido', {
        id: pedidoCriado.id,
        status: pedidoCriado.status,
        total: pedidoCriado.total,
        criadoEm: pedidoCriado.criadoEm,
      })
    } catch {
      console.warn('⚠️ WebSocket ainda não inicializado.')
    }

    return pedidoCriado
  }

  /* ============================= */
  /* BUSCAR PEDIDO POR ID (SIMPLES) */
  /* ============================= */

  async buscarPorId(id: string) {
    return prisma.pedido.findUnique({
      where: { id },
      include: {
        itens: true,
      },
    })
  }

  /* ============================= */
  /* BUSCAR PEDIDO COM PRODUTOS (IMPORTANTE PARA CHECKOUT) */
  /* ============================= */

  async buscarPorIdComProdutos(id: string) {
    return prisma.pedido.findUnique({
      where: { id },
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
      },
    })
  }

  /* ============================= */
  /* ATUALIZAR STATUS */
  /* ============================= */

  async atualizarStatus(id: string, novoStatus: StatusPedido) {
    const pedido = await prisma.pedido.findUnique({
      where: { id },
    })

    if (!pedido) {
      throw new AppError('Pedido não encontrado.', 404)
    }

    const regras: Record<StatusPedido, StatusPedido[]> = {
      RECEBIDO: ['EM_PREPARO', 'CANCELADO'],
      EM_PREPARO: ['PRONTO', 'CANCELADO'],
      PRONTO: ['ENTREGUE'],
      ENTREGUE: [],
      CANCELADO: [],
    }

    const transicoesPermitidas = regras[pedido.status]

    if (!transicoesPermitidas.includes(novoStatus)) {
      throw new AppError(
        `Transição inválida de ${pedido.status} para ${novoStatus}.`,
        400
      )
    }

    const pedidoAtualizado = await prisma.pedido.update({
      where: { id },
      data: { status: novoStatus },
      include: {
        itens: true,
      },
    })

    try {
      const io = getIO()
      io.emit('pedido_atualizado', pedidoAtualizado)
    } catch {
      console.warn('⚠️ WebSocket ainda não inicializado.')
    }

    return pedidoAtualizado
  }

  /* ============================= */
  /* LISTAR PEDIDOS */
  /* ============================= */

  async listarPedidos(status?: string) {
    const where = status
      ? { status: status as StatusPedido }
      : undefined

    return prisma.pedido.findMany({
      where,
      include: {
        itens: true,
      },
      orderBy: {
        criadoEm: 'desc',
      },
    })
  }

  /* ============================= */
  /* DASHBOARD */
  /* ============================= */

  async dashboardPedidos() {
    const pedidos = await prisma.pedido.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    })

    const base: Record<StatusPedido, number> = {
      RECEBIDO: 0,
      EM_PREPARO: 0,
      PRONTO: 0,
      ENTREGUE: 0,
      CANCELADO: 0,
    }

    pedidos.forEach((item) => {
      base[item.status] = item._count.status
    })

    const total = Object.values(base).reduce(
      (acc, curr) => acc + curr,
      0
    )

    return {
      ...base,
      TOTAL: total,
    }
  }
}

export default new PedidoService()