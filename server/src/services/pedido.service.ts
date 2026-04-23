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
      adicionais?: { nome: string; preco: number }[] // 🔥 NOVO
    }[]
    telefone?: string
    origem?: string
    endereco?: string
  }) {

    if (!Array.isArray(data.itens) || data.itens.length === 0) {
      throw new AppError('Pedido precisa conter ao menos um item.', 400)
    }

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

      const precoBase = Number(produto.preco)

      const adicionaisTotal = (item.adicionais || []).reduce(
        (acc, add) => acc + Number(add.preco),
        0
      )

      const precoFinal = precoBase + adicionaisTotal
      const subtotal = precoFinal * item.quantidade

      totalCalculado += subtotal

      return {
        produtoId: produto.id,
        quantidade: item.quantidade,
        precoUnit: precoFinal,

        // 🔥 SALVAR ADICIONAIS
        adicionais: {
          create: (item.adicionais || []).map((add) => ({
            nome: add.nome,
            preco: add.preco
          }))
        }
      }
    })

    const pedidoCriado = await prisma.$transaction(async (tx) => {

      const ultimo = await tx.pedido.findFirst({
        where: {
          codigo: { not: null }
        },
        orderBy: { codigo: 'desc' },
        select: { codigo: true },
      })

      const novoCodigo = (ultimo?.codigo || 1000) + 1

      return tx.pedido.create({
        data: {
          codigo: novoCodigo,

          total: totalCalculado,
          telefone: data.telefone,
          origem: data.origem
            ? (data.origem as OrigemPedido)
            : undefined,
          endereco: data.endereco,
          status: StatusPedido.AGUARDANDO_PAGAMENTO,

          itens: {
            create: itensParaCriar
          },
        },
        include: {
          itens: {
            include: {
              produto: true,
              adicionais: true // 🔥 CRÍTICO
            }
          },
        },
      })

    })

    return pedidoCriado
  }

  /* ============================= */
  /* BUSCAR */
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
      include: {
        itens: {
          include: {
            produto: true,
            adicionais: true // 🔥 CRÍTICO
          }
        }
      },
    })

    if (!pedido) throw new AppError('Pedido não encontrado.', 404)

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
      include: {
        itens: {
          include: {
            produto: true,
            adicionais: true // 🔥 CRÍTICO
          }
        }
      },
    })

    try {
      getIO().emit('pedido_atualizado', atualizado)
    } catch {}

    return atualizado
  }

  /* ============================= */
  /* LISTAR */
  /* ============================= */

  async listarPedidos(status?: string) {
    return prisma.pedido.findMany({
      where: status ? { status: status as StatusPedido } : undefined,
      include: {
        itens: {
          include: {
            produto: true,
            adicionais: true // 🔥 CRÍTICO
          }
        }
      },
      orderBy: { criadoEm: 'desc' },
    })
  }
}

export default new PedidoService()