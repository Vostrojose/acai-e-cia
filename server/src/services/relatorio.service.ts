import prisma from './prisma'
import pdfService from './pdf.service'
import { TipoRelatorio } from '@prisma/client'
import emailService from './email.service'
import securityLogService from './securityLog.service'

class RelatorioService {
  private async verificarExecucaoExistente(
    tipo: TipoRelatorio,
    referencia: string,
  ) {
    return prisma.execucaoRelatorio.findUnique({
      where: {
        tipo_referencia: {
          tipo,
          referencia,
        },
      },
    })
  }

  async gerarRelatorio(
    tipo: TipoRelatorio,
    referencia: string,
    periodoInicio: Date,
    periodoFim: Date,
  ) {
    const execucaoExistente = await this.verificarExecucaoExistente(
      tipo,
      referencia,
    )

    if (execucaoExistente) {
      console.log(`[RELATORIOS] ${tipo} ${referencia} já foi gerado`)

      const relatorioExistente = await prisma.relatorio.findUnique({
        where: {
          tipo_referencia: {
            tipo,
            referencia,
          },
        },
      })

      if (relatorioExistente) {
        if (relatorioExistente.arquivoPdf) {
          const existe = await pdfService.existeArquivo(
            relatorioExistente.arquivoPdf,
          )

          if (!existe) {
            console.log('[RELATORIOS] PDF não encontrado, regenerando...')
          } else {
            return relatorioExistente
          }
        } else {
          console.log(
            '[RELATORIOS] Relatório encontrado sem PDF, regenerando...',
          )
        }
      }
    }
    await securityLogService.registrar({
      tipo: 'RELATORIO',
      acao: `GERAR_${tipo}`,

      detalhes: {
        referencia,
        periodoInicio,
        periodoFim,
      },
    })
    const pedidos = await prisma.pedido.findMany({
      where: {
        origem: 'BALCAO',

        status: 'ENTREGUE',

        criadoEm: {
          gte: periodoInicio,
          lte: periodoFim,
        },
      },

      include: {
        itens: {
          select: {
            nomeProduto: true,
            quantidade: true,
            produto: {
              select: {
                nome: true,
              },
            },
          },
        },
      },
    })
    let movimentacaoTotal = 0
    let recebido = 0
    let fiados = 0
    let aguardandoPagamento = 0
    let cancelados = 0

    let totalPix = 0
    let totalDinheiro = 0
    let totalCredito = 0
    let pedidosBalcao = 0
    let pedidosOnline = 0

    let vendasBalcao = 0
    let vendasOnline = 0
    const produtosMap = new Map<string, number>()

    for (const pedido of pedidos) {
      const valor = Number(pedido.total)

      pedidosBalcao++
      vendasBalcao += valor

      movimentacaoTotal += valor

      if (pedido.formaPagamentoBalcao === 'FIADO') {
        fiados += valor
        continue
      }

      recebido += valor

      if (pedido.pagamentoId) {
        totalPix += valor
      } else {
        totalDinheiro += valor
      }
    }

    for (const pedido of pedidos) {
      for (const item of pedido.itens) {
        const nome = item.nomeProduto || item.produto?.nome || 'Produto'

        produtosMap.set(nome, (produtosMap.get(nome) || 0) + item.quantidade)
      }
    }

    let produtoTop = 'Nenhum'
    let quantidadeProdutoTop = 0
    let top5Produtos: {
      nome: string
      quantidade: number
    }[] = []

    for (const [nome, quantidade] of produtosMap.entries()) {
      if (quantidade > quantidadeProdutoTop) {
        produtoTop = nome
        quantidadeProdutoTop = quantidade
      }
    }

    top5Produtos = [...produtosMap.entries()]
      .map(([nome, quantidade]) => ({
        nome,
        quantidade,
      }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5)

    const ticketMedio =
      pedidos.length > 0 ? movimentacaoTotal / pedidos.length : 0
    const dados = {
      movimentacaoTotal,

      recebido,

      fiados,

      aguardandoPagamento,

      cancelados,
      totalPix,

      totalDinheiro,

      totalCredito,

      pedidos: pedidos.length,

      pedidosBalcao,

      pedidosOnline,

      vendasBalcao,

      vendasOnline,

      ticketMedio,

      produtoTop,

      quantidadeProdutoTop,
      top5Produtos,
    }
    const nomeArquivo = `relatorio-${tipo.toLowerCase()}-${referencia}.pdf`

    const arquivoPdf = await pdfService.gerarPdfRelatorio(nomeArquivo, {
      tipo,

      movimentacaoTotal,

      recebido,

      fiados,

      aguardandoPagamento,

      cancelados,
      totalPix,

      totalDinheiro,

      totalCredito,

      pedidos: pedidos.length,

      pedidosBalcao,

      pedidosOnline,

      vendasBalcao,

      vendasOnline,

      ticketMedio,

      produtoTop,

      quantidadeProdutoTop,
      top5Produtos,
    })

    const relatorio = await prisma.relatorio.upsert({
      where: {
        tipo_referencia: {
          tipo,
          referencia,
        },
      },

      update: {
        dados,

        periodoInicio,

        periodoFim,

        arquivoPdf,
      },

      create: {
        tipo,

        referencia,

        periodoInicio,

        periodoFim,

        dados,

        arquivoPdf,
      },
    })

    await prisma.execucaoRelatorio.upsert({
      where: {
        tipo_referencia: {
          tipo,
          referencia,
        },
      },

      update: {
        status: 'SUCESSO',
        observacao: 'Relatório atualizado',
        executadoEm: new Date(),
      },

      create: {
        tipo,
        referencia,
        status: 'SUCESSO',
        observacao: 'Relatório gerado automaticamente',
      },
    })

    await securityLogService.registrar({
      tipo: 'RELATORIO',
      acao: `GERADO_${tipo}`,

      entidade: 'RELATORIO',
      entidadeId: relatorio.id,

      detalhes: {
        referencia,
        movimentacaoTotal,
        pedidos: pedidos.length,
      },
    })

    return relatorio
  }

  async gerarRelatorioDiario() {
    const agora = new Date()

    const brasilia = new Date(
      agora.toLocaleString('en-US', {
        timeZone: 'America/Sao_Paulo',
      }),
    )

    const inicio = new Date(brasilia)

    inicio.setHours(0, 0, 0, 0)

    const fim = new Date(brasilia)

    fim.setHours(23, 59, 59, 999)

    const referencia = `${brasilia.getFullYear()}-${String(
      brasilia.getMonth() + 1,
    ).padStart(2, '0')}-${String(brasilia.getDate()).padStart(2, '0')}`

    return this.gerarRelatorio(TipoRelatorio.DIARIO, referencia, inicio, fim)
  }

  async gerarRelatorioSemanal() {
    const hoje = new Date()

    const brasilia = new Date(
      hoje.toLocaleString('en-US', {
        timeZone: 'America/Sao_Paulo',
      }),
    )

    const fim = new Date(brasilia)

    fim.setHours(20, 0, 0, 0)

    const diaSemana = fim.getDay()

    const diasDesdeSabado = diaSemana === 6 ? 0 : diaSemana + 1

    fim.setDate(fim.getDate() - diasDesdeSabado)

    const inicio = new Date(fim)

    inicio.setDate(inicio.getDate() - 7)

    inicio.setHours(0, 0, 0, 0)

    const referencia = fim.toISOString().split('T')[0]

    return this.gerarRelatorio(TipoRelatorio.SEMANAL, referencia, inicio, fim)
  }

  async gerarRelatorioMensal() {
    const hoje = new Date()

    const brasilia = new Date(
      hoje.toLocaleString('en-US', {
        timeZone: 'America/Sao_Paulo',
      }),
    )

    const ano = brasilia.getFullYear()

    const mes = brasilia.getMonth()

    const inicio = new Date(ano, mes, 1, 0, 0, 0, 0)

    const fim = new Date(brasilia)

    const referencia = `${ano}-${String(mes + 1).padStart(2, '0')}`

    return this.gerarRelatorio(TipoRelatorio.MENSAL, referencia, inicio, fim)
  }
  async listarRelatorios() {
    return prisma.relatorio.findMany({
      orderBy: {
        criadoEm: 'desc',
      },
    })
  }

  async buscarRelatorioPorId(id: string) {
    return prisma.relatorio.findUnique({
      where: {
        id,
      },
    })
  }

  async enviarRelatorioPorEmail(relatorioId: string) {
    const relatorio = await prisma.relatorio.findUnique({
      where: {
        id: relatorioId,
      },
    })

    if (!relatorio) {
      throw new Error('Relatório não encontrado')
    }

    if (!relatorio.arquivoPdf) {
      throw new Error('PDF não encontrado')
    }

    try {
      console.log(
        `[EMAIL] Enviando relatório ${relatorio.tipo} (${relatorio.id})`,
      )

      await emailService.enviarRelatorio(
        `Relatório ${relatorio.tipo}`,
        relatorio.arquivoPdf,
      )

      console.log(`[EMAIL] Relatório ${relatorio.tipo} enviado com sucesso`)
    } catch (error) {
      console.error(
        `[EMAIL] Falha ao enviar relatório ${relatorio.tipo}`,
        error,
      )

      throw error
    }
    console.log(`[EMAIL] Relatório ${relatorio.tipo} enviado com sucesso`)
    await prisma.relatorio.update({
      where: {
        id: relatorioId,
      },

      data: {
        enviadoEmail: true,
      },
    })

    return true
  }
  async gerarEEnviarRelatorioDiario() {
    const relatorio = await this.gerarRelatorioDiario()

    await this.enviarRelatorioPorEmail(relatorio.id)

    return relatorio
  }

  async gerarEEnviarRelatorioSemanal() {
    const relatorio = await this.gerarRelatorioSemanal()

    await this.enviarRelatorioPorEmail(relatorio.id)

    return relatorio
  }

  async gerarEEnviarRelatorioMensal() {
    const relatorio = await this.gerarRelatorioMensal()

    await this.enviarRelatorioPorEmail(relatorio.id)

    return relatorio
  }
}

export default new RelatorioService()
