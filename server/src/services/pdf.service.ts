import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

class PdfService {
  async gerarPdfTeste() {
    const pastaRelatorios = path.resolve(process.cwd(), 'uploads', 'relatorios')

    if (!fs.existsSync(pastaRelatorios)) {
      fs.mkdirSync(pastaRelatorios, {
        recursive: true,
      })
    }

    const caminhoArquivo = path.join(pastaRelatorios, 'teste.pdf')

    const doc = new PDFDocument()

    const stream = fs.createWriteStream(caminhoArquivo)

    doc.pipe(stream)

    doc.fontSize(20)
    doc.text('AÇAÍ & COMPANHIA')

    doc.moveDown()

    doc.fontSize(16)
    doc.text('PDF DE TESTE')

    doc.moveDown()

    doc.fontSize(12)
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`)

    doc.end()

    return new Promise<string>((resolve, reject) => {
      stream.on('finish', () => {
        resolve(caminhoArquivo)
      })

      stream.on('error', reject)
    })
  }

  async gerarPdfRelatorio(nomeArquivo: string, dados: any) {
    const pastaRelatorios = path.resolve(process.cwd(), 'uploads', 'relatorios')

    if (!fs.existsSync(pastaRelatorios)) {
      fs.mkdirSync(pastaRelatorios, {
        recursive: true,
      })
    }

    const caminhoArquivo = path.join(pastaRelatorios, nomeArquivo)

    const doc = new PDFDocument()

    const stream = fs.createWriteStream(caminhoArquivo)

    doc.pipe(stream)

    doc.fontSize(20)
    doc.text('AÇAÍ & COMPANHIA')

    doc.moveDown()

    doc.fontSize(16)
    doc.text(`RELATÓRIO ${dados.tipo}`)
    const moeda = (valor: number) =>
      valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })

    doc.moveDown()

    doc.fontSize(12)

    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`)

    doc.moveDown()

    doc.fontSize(14)
    doc.text('RESUMO FINANCEIRO')

    doc.moveDown(0.5)

    doc.fontSize(12)

    doc.text(`Movimentação Total: ${moeda(dados.movimentacaoTotal)}`)

    doc.text(`Recebido: ${moeda(dados.recebido)}`)

    doc.text(`Fiados: ${moeda(dados.fiados)}`)

    doc.text(`Aguardando Pagamento: ${moeda(dados.aguardandoPagamento)}`)

    doc.text(`Cancelados: ${moeda(dados.cancelados)}`)

    doc.moveDown()

    doc.fontSize(14)
    doc.text('INDICADORES')

    doc.moveDown(0.5)

    doc.fontSize(12)

    doc.text(`Pedidos: ${dados.pedidos}`)

    doc.text(`Ticket Médio: ${moeda(dados.ticketMedio)}`)

    doc.text(`Produto Mais Vendido: ${dados.produtoTop}`)

    doc.text(`Quantidade Vendida: ${dados.quantidadeProdutoTop}`)
    doc.moveDown()

    doc.fontSize(14)
    doc.text('TOP 5 PRODUTOS')

    doc.moveDown(0.5)

    doc.fontSize(12)

    if (dados.top5Produtos && dados.top5Produtos.length > 0) {
      dados.top5Produtos.forEach((produto: any, index: number) => {
        doc.text(`${index + 1}º - ${produto.nome} (${produto.quantidade})`)
      })
    }
    doc.moveDown()

    doc.fontSize(14)
    doc.text('VENDAS POR CANAL')

    doc.moveDown(0.5)

    doc.fontSize(12)

    doc.text(`Pedidos Balcão: ${dados.pedidosBalcao}`)

    doc.text(`Faturamento Balcão: ${moeda(dados.vendasBalcao)}`)

    doc.moveDown(0.5)

    doc.text(`Pedidos Online: ${dados.pedidosOnline}`)

    doc.text(`Faturamento Online: ${moeda(dados.vendasOnline)}`)

    doc.end()

    return new Promise<string>((resolve, reject) => {
      stream.on('finish', () => {
        resolve(caminhoArquivo)
      })

      stream.on('error', reject)
    })
  }
  async existeArquivo(caminho: string) {
    return fs.existsSync(caminho)
  }
}

export default new PdfService()
