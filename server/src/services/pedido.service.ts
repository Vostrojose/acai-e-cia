import prisma from '../services/prisma'
import { StatusPedido, StatusPagamento } from '@prisma/client'

class PedidoService {

  async criarPedido(data: any) {
    const { itens, telefone, endereco, origem } = data

    if (!itens || itens.length === 0) {
      throw new Error('Pedido sem itens')
    }

    let total = 0

    /* ============================= */
    /* CALCULAR TOTAL (CORRETO)      */
    /* ============================= */
    const itensCalculados = []

    for (const item of itens) {
      const produto = await prisma.produto.findUnique({
        where: { id: item.produtoId },
      })

      if (!produto) {
        throw new Error("Produto não encontrado")
      }

      const adicionais = Array.isArray(item.adicionais)
        ? item.adicionais
        : []

      const totalAdicionais = adicionais.reduce(
        (soma: number, add: any) => soma + Number(add.preco || 0),
        0
      )

      const precoUnit = Number(produto.preco) + totalAdicionais

      total += precoUnit * item.quantidade

      itensCalculados.push({
        produto,
        quantidade: item.quantidade,
        precoUnit,
        adicionais
      })

      console.log("🔥 CALCULO ITEM:", {
        produto: Number(produto.preco),
        adicionaisRecebidos: adicionais,
        totalAdicionais,
        precoFinal: precoUnit
      })
    }

    /* ============================= */
    /* GERAR CÓDIGO                 */
    /* ============================= */
    const ultimoPedido = await prisma.pedido.findFirst({
      where: { codigo: { not: null } },
      orderBy: { codigo: 'desc' }
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
    for (const item of itensCalculados) {

      const itemCriado = await prisma.itemPedido.create({
        data: {
          pedidoId: pedido.id,
          produtoId: item.produto.id,
          quantidade: item.quantidade,
          precoUnit: item.precoUnit
        }
      })

      if (item.adicionais.length > 0) {
        await prisma.itemPedidoAdicional.createMany({
          data: item.adicionais.map((add: any) => ({
            nome: add.nome,
            preco: Number(add.preco),
            itemPedidoId: itemCriado.id
          }))
        })

        console.log("✅ ADICIONAIS SALVOS:", item.adicionais)
      } else {
        console.log("⚠️ ITEM SEM ADICIONAIS")
      }
    }

    return pedido
  }

  /* resto do código permanece igual */
}

export default new PedidoService()