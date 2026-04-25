import prisma from "../services/prisma"

class AuditoriaService {

  async obterDados() {
    const agora = new Date()

    const inicioDia = new Date(agora)
    inicioDia.setHours(0, 0, 0, 0)

    const inicioSemana = new Date(agora)
    inicioSemana.setDate(agora.getDate() - 7)

    const inicioMes = new Date(agora)
    inicioMes.setMonth(agora.getMonth() - 1)

    /* ============================= */
    /* BUSCAR PEDIDOS ENTREGUES      */
    /* ============================= */

    const pedidos = await prisma.pedido.findMany({
      where: {
        status: "ENTREGUE"
      },
      include: {
        itens: {
          include: {
            produto: true
          }
        }
      }
    })

    /* ============================= */
    /* CALCULAR TOTAIS               */
    /* ============================= */

    let diarias = 0
    let semanais = 0
    let mensais = 0

    const mapaProdutos: Record<string, number> = {}

    for (const pedido of pedidos) {
      const data = new Date(pedido.criadoEm)
      const total = Number(pedido.total)

      if (data >= inicioDia) diarias += total
      if (data >= inicioSemana) semanais += total
      if (data >= inicioMes) mensais += total

      for (const item of pedido.itens) {
        const nome = item.produto.nome

        if (!mapaProdutos[nome]) {
          mapaProdutos[nome] = 0
        }

        mapaProdutos[nome] += item.quantidade
      }
    }

    /* ============================= */
    /* FORMATAR PRODUTOS             */
    /* ============================= */

    const produtos = Object.entries(mapaProdutos)
      .map(([nome, qtd]) => ({ nome, qtd }))
      .sort((a, b) => b.qtd - a.qtd)

    return {
      diarias,
      semanais,
      mensais,
      produtos
    }
  }
}

export default new AuditoriaService()