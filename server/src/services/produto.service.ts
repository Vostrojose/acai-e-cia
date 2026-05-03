import prisma from '../lib/prisma'

interface CriarProdutoDTO {
  nome: string
  descricao?: string
  preco: number
  ativo?: boolean

  disponivelSeg?: any
  disponivelTer?: any
  disponivelQua?: any
  disponivelQui?: any
  disponivelSex?: any
  disponivelSab?: any
  disponivelDom?: any
}

class ProdutoService {

  async criarProduto(data: CriarProdutoDTO) {
    return await prisma.produto.create({
      data: {
        nome: data.nome,
        descricao: data.descricao,
        preco: data.preco,
        ativo: data.ativo ?? true,

        /* 🔥 AGORA SIM SALVANDO OS DIAS */
        disponivelSeg: data.disponivelSeg === true || data.disponivelSeg === 'true',
        disponivelTer: data.disponivelTer === true || data.disponivelTer === 'true',
        disponivelQua: data.disponivelQua === true || data.disponivelQua === 'true',
        disponivelQui: data.disponivelQui === true || data.disponivelQui === 'true',
        disponivelSex: data.disponivelSex === true || data.disponivelSex === 'true',
        disponivelSab: data.disponivelSab === true || data.disponivelSab === 'true',
        disponivelDom: data.disponivelDom === true || data.disponivelDom === 'true',
      },
    })
  }

  async listarProdutos() {
    const produtos = await prisma.produto.findMany({
      orderBy: {
        criadoEm: 'desc',
      },
      include: {
        adicionais: true
      }
    })

    return produtos.map((p) => ({
      ...p,
      preco: Number(p.preco),

      /* 🔥 BLINDAGEM FINAL (EVITA BUG NO FRONT) */
      disponivelSeg: Boolean(p.disponivelSeg),
      disponivelTer: Boolean(p.disponivelTer),
      disponivelQua: Boolean(p.disponivelQua),
      disponivelQui: Boolean(p.disponivelQui),
      disponivelSex: Boolean(p.disponivelSex),
      disponivelSab: Boolean(p.disponivelSab),
      disponivelDom: Boolean(p.disponivelDom),
    }))
  }

  async alterarStatus(id: string, ativo: boolean) {
    return await prisma.produto.update({
      where: { id },
      data: { ativo },
    })
  }

  async removerProduto(id: string) {
    return await prisma.produto.delete({
      where: { id }
    })
  }
}

export default new ProdutoService()
