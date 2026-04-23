import prisma from '../lib/prisma'
import { StatusPedido, StatusPagamento, OrigemPedido } from '@prisma/client'
import { AppError } from '../utils/AppError'
import { getIO } from '../websocket/socket'

class PedidoService {

  /* ============================= */
  /* CRIAR PEDIDO */
  /* ============================= */

  async criarPedido(data: {
    itens: {
      produtoId: string
      quantidade: number
    }[]
    telefone?: string
    origem?: string
    endereco?: string
  }) {

    if (!Array.isArray(data.itens) || data.itens.length === 0) {
      throw new AppError('Pedido precisa conter ao menos um item.', 400)
    }

    const idsDuplicados = new Set<string>()
    data.itens.forEach((i) => {
      if (idsDuplicados.has(i.produtoId)) {
        throw new AppError('Produto duplicado no pedido.', 400)
      }
      idsDuplicados.add(i.produtoId)
    })

    data.itens.forEach((item) => {
      if (!item.produtoId || item.produtoId.length < 10) {
        throw new AppError('produtoId inválido.', 400)
      }
      if (!Number.isInteger(item.quantidade) || item.quantidade <= 0) {
        throw new AppError('Quantidade inválida.', 400)
      }
    })

    const produtosIds = data.itens.map((i) => i.produtoId)

    const produtos = await prisma.produto.findMany({
      where: { id: { in: produtosIds }, ativo: true },
    })

    if (produtos.length !== produtosIds.length) {
      throw new AppError('Um ou mais produtos são inválidos.', 400)
    }

    const produtosMap = new Map(produtos.map((p) => [p.id, p]))

    let totalCalculado = 0

    const itensParaCriar = data.itens.map((item) => {
      const produto = produtosMap.get(item.produtoId)

      if (!produto) throw new AppError('Produto não encontrado.', 400)

      const preco = Number(produto.preco)
      const subtotal = preco * item.quantidade

      totalCalculado += subtotal

      return {
        produtoId: produto.id,
        quantidade: item.quantidade,
        precoUnit: preco,
      }
    })

   const pedidoCriado = await prisma.$transaction(async (tx) => {

const ultimo = await tx.pedido.findFirst({
  where: {
    codigo: {
      not: null
    }
  },
  orderBy: { codigo: 'desc' },
  select: { codigo: true },
})

  const novoCodigo = (ultimo?.codigo || 1000) + 1

  return tx.pedido.create({
    data: {
      codigo: novoCodigo, // ✅ NOVO CAMPO

      total: totalCalculado,
      telefone: data.telefone,
      origem: data.origem
        ? (data.origem as OrigemPedido)
        : undefined,
      endereco: data.endereco,
      status: StatusPedido.AGUARDANDO_PAGAMENTO,
      itens: { create: itensParaCriar },
    },
    include: {
      itens: true,
    },
  })

})

    return pedidoCriado
  }

  /* ============================= */
  /* BUSCAR (BLINDADO) */
  /* ============================= */

  async buscarPorId(id: string) {
    const cleanId = id.trim()

    const pedido = await prisma.pedido.findFirst({
      where: {
        OR: [
          { id: cleanId },
          { externalReference: cleanId }
        ]
      },
      include: { itens: true },
    })

    if (!pedido) throw new AppError('Pedido não encontrado.', 404)

    return pedido
  }

  async buscarPorIdComProdutos(id: string) {
    const cleanId = id.trim()

    const pedido = await prisma.pedido.findFirst({
      where: {
        OR: [
          { id: cleanId },
          { externalReference: cleanId }
        ]
      },
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
      },
    })

    return pedido
  }

  /* ============================= */
  /* STATUS */
  /* ============================= */

  async atualizarStatus(id: string, novoStatus: StatusPedido) {
    const pedido = await prisma.pedido.findUnique({ where: { id } })

    if (!pedido) throw new AppError('Pedido não encontrado.', 404)

    const atualizado = await prisma.pedido.update({
      where: { id },
      data: { status: novoStatus },
      include: { itens: true },
    })

    try {
      getIO().emit('pedido_atualizado', atualizado)
    } catch {}

    return atualizado
  }

  /* ============================= */
  /* PAGAMENTO */
  /* ============================= */

  async atualizarPagamento(externalReference: string, novoStatus: StatusPagamento) {

    if (!Object.values(StatusPagamento).includes(novoStatus)) {
      throw new AppError('Status de pagamento inválido.', 400)
    }

    const pedido = await prisma.pedido.findFirst({
      where: {
        OR: [
          { id: externalReference },
          { externalReference }
        ]
      },
    })

    if (!pedido) throw new AppError('Pedido não encontrado.', 404)

    return prisma.pedido.update({
      where: { id: pedido.id },
      data: { statusPagamento: novoStatus },
      include: { itens: true },
    })
  }

  /* ============================= */
  /* LISTAR */
  /* ============================= */

  async listarPedidos(status?: string) {
    return prisma.pedido.findMany({
      where: status ? { status: status as StatusPedido } : undefined,
      include: { itens: true },
      orderBy: { criadoEm: 'desc' },
    })
  }

  /* ============================= */
  /* DASHBOARD */
  /* ============================= */

  async dashboardPedidos() {
    const pedidos = await prisma.pedido.groupBy({
      by: ['status'],
      _count: { status: true },
    })

    const base: Record<StatusPedido, number> = {
      AGUARDANDO_PAGAMENTO: 0,
      RECEBIDO: 0,
      EM_PREPARO: 0,
      PRONTO: 0,
      ENTREGUE: 0,
      CANCELADO: 0,
    }

    pedidos.forEach((item) => {
      base[item.status] = item._count.status
    })

    const total = Object.values(base).reduce((acc, curr) => acc + curr, 0)

    return { ...base, TOTAL: total }
  }
}

export default new PedidoService()