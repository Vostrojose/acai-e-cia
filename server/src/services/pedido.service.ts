import prisma from '../services/prisma'
import { StatusPedido, StatusPagamento } from '@prisma/client'

class PedidoService {

  /* ============================= */
  /* CRIAR PEDIDO                  */
  /* ============================= */
  async criarPedido(data: any) {
    const { itens, telefone, endereco, origem } = data

    if (!itens || itens.length === 0) {
      throw new Error('Pedido sem itens')
    }

    let total = 0

    /* ============================= */
    /* CALCULAR TOTAL                */
    /* ============================= */
    for (const item of itens) {
      const produto = await prisma.produto.findUnique({
        where: { id: item.produtoId }
      })

      if (!produto) {
        throw new Error('Produto não encontrado')
      }

      let precoItem = Number(produto.preco)

      if (item.adicionais?.length) {
        for (const add of item.adicionais) {
          precoItem += Number(add.preco)
        }
      }

      total += precoItem * item.quantidade
    }

    /* ============================= */
    /* GERAR CÓDIGO SEQUENCIAL       */
    /* ============================= */
   const ultimoPedido = await prisma.pedido.findFirst({
  where: {
    codigo: {
      not: null
    }
  },
  orderBy: {
    codigo: 'desc'
  }
})

    const proximoCodigo = (ultimoPedido?.codigo ?? 1000) + 1

    /* ============================= */
    /* CRIAR PEDIDO                 */
    /* ============================= */
    const pedido = await prisma.pedido.create({
      data: {
        telefone,
        endereco,
        origem,
        total,
        codigo: proximoCodigo
      }
    })

    /* ============================= */
    /* CRIAR ITENS + ADICIONAIS     */
    /* ============================= */
    for (const item of itens) {
      const produto = await prisma.produto.findUnique({
        where: { id: item.produtoId }
      })

      if (!produto) {
        throw new Error('Produto não encontrado')
      }

      let precoUnit = Number(produto.preco)

      if (item.adicionais?.length) {
        for (const add of item.adicionais) {
          precoUnit += Number(add.preco)
        }
      }

      const itemCriado = await prisma.itemPedido.create({
        data: {
          pedidoId: pedido.id,
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnit
        }
      })

      if (item.adicionais?.length) {
        await prisma.itemPedidoAdicional.createMany({
          data: item.adicionais.map((add: any) => ({
            nome: add.nome,
            preco: add.preco,
            itemPedidoId: itemCriado.id
          }))
        })
      }
    }

    return pedido
  }

  /* ============================= */
  /* LISTAR PEDIDOS                */
  /* ============================= */
  async listarPedidos(status?: string) {
    return prisma.pedido.findMany({
      where: status ? { status: status as StatusPedido } : undefined,
      include: {
        itens: {
          include: {
            produto: true,
            adicionais: true
          }
        }
      },
      orderBy: {
        criadoEm: 'desc'
      }
    })
  }

  /* ============================= */
  /* BUSCAR POR ID                 */
  /* ============================= */
  async buscarPorId(id: string) {
    return prisma.pedido.findUnique({
      where: { id }
    })
  }

  /* ============================= */
  /* BUSCAR COMPLETO (IMPORTANTE)  */
  /* ============================= */
  async buscarPorIdComProdutos(id: string) {
    return prisma.pedido.findUnique({
      where: { id },
      include: {
        itens: {
          include: {
            produto: true,
            adicionais: true
          }
        }
      }
    })
  }

  /* ============================= */
  /* ATUALIZAR STATUS              */
  /* ============================= */
  async atualizarStatus(id: string, status: StatusPedido) {
    return prisma.pedido.update({
      where: { id },
      data: { status }
    })
  }

  /* ============================= */
  /* ATUALIZAR PAGAMENTO           */
  /* ============================= */
  async atualizarPagamento(
    id: string,
    statusPagamento: string,
    pagamentoId?: string
  ) {
    let pagamentoEnum: StatusPagamento
    let statusPedido: StatusPedido

    switch (statusPagamento?.toLowerCase()) {
      case 'approved':
      case 'aprovado':
        pagamentoEnum = StatusPagamento.APROVADO
        statusPedido = StatusPedido.RECEBIDO
        break

      case 'pending':
      case 'pendente':
        pagamentoEnum = StatusPagamento.PENDENTE
        statusPedido = StatusPedido.AGUARDANDO_PAGAMENTO
        break

      case 'rejected':
      case 'recusado':
        pagamentoEnum = StatusPagamento.RECUSADO
        statusPedido = StatusPedido.CANCELADO
        break

      case 'cancelled':
      case 'cancelado':
        pagamentoEnum = StatusPagamento.CANCELADO
        statusPedido = StatusPedido.CANCELADO
        break

      default:
        pagamentoEnum = StatusPagamento.PENDENTE
        statusPedido = StatusPedido.AGUARDANDO_PAGAMENTO
    }

    return prisma.pedido.update({
      where: { id },
      data: {
        statusPagamento: pagamentoEnum,
        pagamentoId,
        status: statusPedido
      }
    })
  }

  /* ============================= */
  /* REMOVER PEDIDO                */
  /* ============================= */
  async removerPedido(id: string) {
    return prisma.pedido.delete({
      where: { id }
    })
  }
}

export default new PedidoService()