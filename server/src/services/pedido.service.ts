import prisma from '../services/prisma'
import { StatusPedido, StatusPagamento } from '@prisma/client'

class PedidoService {
  async criarPedido(data: any) {
    const { itens, telefone, endereco, origem } = data

    if (!itens || itens.length === 0) {
      throw new Error('Pedido sem itens')
    }

    return await prisma.$transaction(async (tx) => {
      let total = 0

      const ultimoPedido = await tx.pedido.findFirst({
        where: { codigo: { not: null } },
        orderBy: { codigo: 'desc' },
      })

      const proximoCodigo = (ultimoPedido?.codigo ?? 1000) + 1

      const pedido = await tx.pedido.create({
        data: {
          telefone,
          endereco,
          origem,
          total: 0,
          codigo: proximoCodigo,
        },
      })

      for (const item of itens) {
        const produto = await tx.produto.findUnique({
          where: { id: item.produtoId },
        })

        if (!produto) {
          throw new Error('Produto não encontrado')
        }

        const adicionais = Array.isArray(item.adicionais) ? item.adicionais : []

        const totalAdicionais = adicionais.reduce(
          (soma: number, add: any) =>
            soma + Number(add.preco || 0) * Number(add.quantidade || 1),
          0,
        )

        const precoBase = Number(item.preco || produto.preco)

        const precoUnit = precoBase + totalAdicionais

        total += precoUnit * item.quantidade

        const itemCriado = await tx.itemPedido.create({
          data: {
            pedidoId: pedido.id,

            produtoId: produto.id,

            nomeProduto: produto.nome,

            quantidade: item.quantidade,

            precoUnit,
          },
        })

        if (adicionais.length > 0) {
          await tx.itemPedidoAdicional.createMany({
            data: adicionais.map((add: any) => ({
              nome: add.nome,
              preco: Number(add.preco),

              quantidade: Number(add.quantidade || 1),

              itemPedidoId: itemCriado.id,
            })),
          })
        }
      }
      await tx.pedido.update({
        where: { id: pedido.id },
        data: { total },
      })
      return await tx.pedido.findUnique({
        where: { id: pedido.id },
        include: {
          itens: {
            include: {
              produto: true,
              adicionais: true,
            },
          },
        },
      })
    })
  }
  async listarPedidos(status?: string) {
    return prisma.pedido.findMany({
      where: status ? { status: status as StatusPedido } : undefined,
      include: {
        itens: {
          include: {
            produto: true,
            adicionais: true,
          },
        },
      },
      orderBy: { criadoEm: 'desc' },
    })
  }
  async listarPedidosPaginado(pagina = 1, limite = 50, status?: string) {
    const where = status
      ? {
          status: status as StatusPedido,
        }
      : undefined

    const [pedidos, total] = await Promise.all([
      prisma.pedido.findMany({
        where,

        take: limite,

        skip: (pagina - 1) * limite,

        include: {
          itens: {
            include: {
              produto: true,
              adicionais: true,
            },
          },
        },

        orderBy: {
          criadoEm: 'desc',
        },
      }),

      prisma.pedido.count({
        where,
      }),
    ])

    return {
      pedidos,
      total,
      pagina,
      limite,

      totalPaginas: Math.ceil(total / limite),
    }
  }

  async buscarPorId(id: string) {
    return prisma.pedido.findUnique({
      where: { id },
      include: {
        itens: {
          include: {
            produto: true,
            adicionais: true,
          },
        },
      },
    })
  }
  async buscarPorIdComProdutos(id: string) {
    return prisma.pedido.findUnique({
      where: { id },
      include: {
        itens: {
          include: {
            produto: true,
            adicionais: true,
          },
        },
      },
    })
  }
  async atualizarStatus(id: string, status: StatusPedido) {
    const pedidoAtual = await prisma.pedido.findUnique({
      where: { id },
    })
    const data: any = { status }
    if (status === StatusPedido.ENTREGUE && !pedidoAtual?.entregueEm) {
      data.entregueEm = new Date()
    }

    return prisma.pedido.update({
      where: { id },
      data,
    })
  }
  async atualizarPagamento(
    id: string,
    statusPagamento: string,
    pagamentoId?: string,
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
        pagamentoEnum = StatusPagamento.PENDENTE
        statusPedido = StatusPedido.AGUARDANDO_PAGAMENTO
        break
      default:
        pagamentoEnum = StatusPagamento.PENDENTE
        statusPedido = StatusPedido.AGUARDANDO_PAGAMENTO
    }
    const pedidoAtual = await prisma.pedido.findUnique({
      where: { id },
    })
    let podeAlterarStatus = true

    if (
      pedidoAtual?.status === StatusPedido.EM_PREPARO ||
      pedidoAtual?.status === StatusPedido.PRONTO ||
      pedidoAtual?.status === StatusPedido.ENTREGUE
    ) {
      podeAlterarStatus = false
    }

    return prisma.pedido.update({
      where: { id },

      data: {
        statusPagamento: pagamentoEnum,
        pagamentoId,

        ...(podeAlterarStatus && {
          status: statusPedido,
        }),
      },
    })
  }
  async removerPedido(id: string) {
    return prisma.pedido.delete({ where: { id } })
  }
}

export default new PedidoService()
