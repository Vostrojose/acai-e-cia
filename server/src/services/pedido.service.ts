import prisma from '../services/prisma'
import { StatusPedido, StatusPagamento } from '@prisma/client'

class PedidoService {
  /* ============================= */
  /* CRIAR PEDIDO (PROFISSIONAL)   */
  /* ============================= */
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
          (soma: number, add: any) => soma + Number(add.preco || 0),
          0,
        )

        const precoUnit = Number(produto.preco) + totalAdicionais

        total += precoUnit * item.quantidade

        const itemCriado = await tx.itemPedido.create({
          data: {
            pedidoId: pedido.id,
            produtoId: produto.id,
            quantidade: item.quantidade,
            precoUnit,
          },
        })

        if (adicionais.length > 0) {
          await tx.itemPedidoAdicional.createMany({
            data: adicionais.map((add: any) => ({
              nome: add.nome,
              preco: Number(add.preco),
              itemPedidoId: itemCriado.id,
            })),
          })
        }
      }

      /* 🔥 ATUALIZA TOTAL */
      await tx.pedido.update({
        where: { id: pedido.id },
        data: { total },
      })

      /* 🔥 RETORNA COMPLETO */
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

  /* ============================= */
  /* LISTAR                        */
  /* ============================= */
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

  /* ============================= */
  /* BUSCAR POR ID (COMPLETO)      */
  /* ============================= */
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

  /* ============================= */
  /* 🔥 NOVO: BUSCAR COMPLETO PADRÃO */
  /* ============================= */
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

  /* ============================= */
  /* ATUALIZAR STATUS              */
  /* ============================= */
  async atualizarStatus(id: string, status: StatusPedido) {
    const data: any = { status }

    // 🔥 SALVA DATA REAL DE ENTREGA
    if (status === StatusPedido.ENTREGUE) {
      data.entregueEm = new Date()
    }

    return prisma.pedido.update({
      where: { id },
      data,
    })
  }

  /* ============================= */
  /* ATUALIZAR PAGAMENTO           */
  /* ============================= */
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

    return prisma.pedido.update({
      where: { id },
      data: {
        statusPagamento: pagamentoEnum,
        pagamentoId,
        status: statusPedido,
      },
    })
  }

  /* ============================= */
  /* REMOVER                       */
  /* ============================= */
  async removerPedido(id: string) {
    return prisma.pedido.delete({ where: { id } })
  }
}

export default new PedidoService()
