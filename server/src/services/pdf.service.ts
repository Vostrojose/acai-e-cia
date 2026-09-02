const PDFDocument = require('pdfkit')
import fs from 'fs'
import path from 'path'

class PdfService {
  async gerarPdfTeste() {
    const pastaRelatorios = path.resolve(
      process.cwd(),
      'uploads',
      'relatorios',
    )

    if (!fs.existsSync(pastaRelatorios)) {
      fs.mkdirSync(pastaRelatorios, {
        recursive: true,
      })
    }

    const caminhoArquivo = path.join(
      pastaRelatorios,
      'teste.pdf',
    )

    const doc = new PDFDocument()

    const stream =
      fs.createWriteStream(caminhoArquivo)

    doc.pipe(stream)

    doc.fontSize(20)
    doc.text('AÇAÍ & COMPANY')

    doc.moveDown()

    doc.fontSize(16)
    doc.text('PDF DE TESTE')

    doc.moveDown()

    doc.fontSize(12)
    doc.text(
      `Gerado em: ${new Date().toLocaleString(
        'pt-BR',
      )}`,
    )

    doc.end()

    return new Promise<string>(
      (resolve, reject) => {
        stream.on('finish', () => {
          resolve(caminhoArquivo)
        })

        stream.on('error', reject)
      },
    )
  }

  async gerarPdfRelatorio(
    nomeArquivo: string,
    dados: any,
    emailsEnviados: string[] = [],
  ) {
    const pastaRelatorios = path.resolve(
      process.cwd(),
      'uploads',
      'relatorios',
    )

    if (!fs.existsSync(pastaRelatorios)) {
      fs.mkdirSync(pastaRelatorios, {
        recursive: true,
      })
    }

    const caminhoArquivo = path.join(
      pastaRelatorios,
      nomeArquivo,
    )

    const doc = new PDFDocument()

    const stream =
      fs.createWriteStream(caminhoArquivo)

    doc.pipe(stream)

    const moeda = (valor: number) =>
      Number(valor || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })

    const dataHora = (data: Date | string) =>
      new Date(data).toLocaleString('pt-BR')

    /*
     * Renderiza os resumos complementares.
     * Usado pelo semanal e mensal.
     */
    const adicionarResumoComplementar = (
      resumo: any,
    ) => {
      if (!resumo || !resumo.dados) {
        return
      }

      const resumoDados = resumo.dados

      doc.addPage()

      doc.fontSize(16)
      doc.text(resumo.titulo)

      doc.moveDown(0.5)

      doc.fontSize(10)
      doc.text(
        `Período: ${dataHora(
          resumo.periodoInicio,
        )} até ${dataHora(resumo.periodoFim)}`,
      )

      doc.moveDown()

      doc.fontSize(14)
      doc.text('RESUMO FINANCEIRO')

      doc.moveDown(0.5)

      doc.fontSize(12)

      doc.text(
        `Movimentação Total: ${moeda(
          resumoDados.movimentacaoTotal,
        )}`,
      )

      doc.text(
        `Recebido: ${moeda(
          resumoDados.recebido,
        )}`,
      )

      doc.text(
        `Fiados: ${moeda(resumoDados.fiados)}`,
      )

      doc.text(
        `Aguardando Pagamento: ${moeda(
          resumoDados.aguardandoPagamento,
        )}`,
      )

      doc.text(
        `Cancelados: ${moeda(
          resumoDados.cancelados,
        )}`,
      )

      doc.moveDown()

      doc.fontSize(14)
      doc.text('INDICADORES')

      doc.moveDown(0.5)

      doc.fontSize(12)

      doc.text(
        `Pedidos: ${resumoDados.pedidos}`,
      )

      doc.text(
        `Ticket Médio: ${moeda(
          resumoDados.ticketMedio,
        )}`,
      )

      doc.text(
        `Produto Mais Vendido: ${resumoDados.produtoTop}`,
      )

      doc.text(
        `Quantidade Vendida: ${resumoDados.quantidadeProdutoTop}`,
      )

      doc.moveDown()

      doc.fontSize(14)
      doc.text('TOP 5 PRODUTOS')

      doc.moveDown(0.5)

      doc.fontSize(12)

      if (
        resumoDados.top5Produtos &&
        resumoDados.top5Produtos.length > 0
      ) {
        resumoDados.top5Produtos.forEach(
          (produto: any, index: number) => {
            doc.text(
              `${index + 1}º - ${produto.nome} (${produto.quantidade})`,
            )
          },
        )
      } else {
        doc.text('Nenhum produto vendido no período.')
      }

      doc.moveDown()

      doc.fontSize(14)
      doc.text('VENDAS POR CANAL')

      doc.moveDown(0.5)

      doc.fontSize(12)

      doc.text(
        `Pedidos Balcão: ${resumoDados.pedidosBalcao}`,
      )

      doc.text(
        `Faturamento Balcão: ${moeda(
          resumoDados.vendasBalcao,
        )}`,
      )

      doc.moveDown(0.5)

      doc.text(
        `Pedidos Online: ${resumoDados.pedidosOnline}`,
      )

      doc.text(
        `Faturamento Online: ${moeda(
          resumoDados.vendasOnline,
        )}`,
      )
    }

    doc.fontSize(20)
    doc.text('AÇAÍ & COMPANY')

    doc.moveDown()

    doc.fontSize(16)
    doc.text(`RELATÓRIO ${dados.tipo}`)

    doc.moveDown(0.5)

    if (emailsEnviados.length > 0) {
      doc.fontSize(12)
      doc.text('Enviado para:')

      emailsEnviados.forEach((email) => {
        doc.text(`• ${email}`)
      })
    }

    doc.moveDown()

    doc.fontSize(12)

    doc.text(
      `Gerado em: ${new Date().toLocaleString(
        'pt-BR',
      )}`,
    )

    doc.moveDown()

    doc.fontSize(14)
    doc.text('RESUMO FINANCEIRO')

    doc.moveDown(0.5)

    doc.fontSize(12)

    doc.text(
      `Movimentação Total: ${moeda(
        dados.movimentacaoTotal,
      )}`,
    )

    doc.text(
      `Recebido: ${moeda(dados.recebido)}`,
    )

    doc.text(`Fiados: ${moeda(dados.fiados)}`)

    doc.text(
      `Aguardando Pagamento: ${moeda(
        dados.aguardandoPagamento,
      )}`,
    )

    doc.text(
      `Cancelados: ${moeda(dados.cancelados)}`,
    )

    doc.moveDown()

    doc.fontSize(14)
    doc.text('INDICADORES')

    doc.moveDown(0.5)

    doc.fontSize(12)

    doc.text(`Pedidos: ${dados.pedidos}`)

    doc.text(
      `Ticket Médio: ${moeda(
        dados.ticketMedio,
      )}`,
    )

    doc.text(
      `Produto Mais Vendido: ${dados.produtoTop}`,
    )

    doc.text(
      `Quantidade Vendida: ${dados.quantidadeProdutoTop}`,
    )

    doc.moveDown()

    doc.fontSize(14)
    doc.text('TOP 5 PRODUTOS')

    doc.moveDown(0.5)

    doc.fontSize(12)

    if (
      dados.top5Produtos &&
      dados.top5Produtos.length > 0
    ) {
      dados.top5Produtos.forEach(
        (produto: any, index: number) => {
          doc.text(
            `${index + 1}º - ${produto.nome} (${produto.quantidade})`,
          )
        },
      )
    } else {
      doc.text('Nenhum produto vendido no período.')
    }

    doc.moveDown()

    doc.fontSize(14)
    doc.text('VENDAS POR CANAL')

    doc.moveDown(0.5)

    doc.fontSize(12)

    doc.text(
      `Pedidos Balcão: ${dados.pedidosBalcao}`,
    )

    doc.text(
      `Faturamento Balcão: ${moeda(
        dados.vendasBalcao,
      )}`,
    )

    doc.moveDown(0.5)

    doc.text(
      `Pedidos Online: ${dados.pedidosOnline}`,
    )

    doc.text(
      `Faturamento Online: ${moeda(
        dados.vendasOnline,
      )}`,
    )

    /*
     * SEMANAL:
     * adiciona resumo do sábado.
     *
     * MENSAL:
     * adiciona último dia do mês.
     */
    if (dados.resumoUltimoDia) {
      adicionarResumoComplementar(
        dados.resumoUltimoDia,
      )
    }

    /*
     * MENSAL:
     * somente existirá quando o último
     * dia do mês também for sábado.
     */
    if (dados.resumoUltimaSemana) {
      adicionarResumoComplementar(
        dados.resumoUltimaSemana,
      )
    }

    doc.end()

    return new Promise<string>(
      (resolve, reject) => {
        stream.on('finish', () => {
          resolve(caminhoArquivo)
        })

        stream.on('error', reject)
      },
    )
  }

  async existeArquivo(caminho: string) {
    return fs.existsSync(caminho)
  }
}

export default new PdfService()