import prisma from '../lib/prisma'

interface CriarProdutoDTO {
  nome: string
  descricao?: string
  preco: number
  ativo?: boolean
}

class ProdutoService {
  async criarProduto(data: CriarProdutoDTO) {
    return await prisma.produto.create({
      data: {
        nome: data.nome,
        descricao: data.descricao,
        preco: data.preco,
        ativo: data.ativo ?? true,
      },
    })
  }

async listarProdutos() {
  const produtos = await prisma.produto.findMany({
    orderBy: {
      criadoEm: 'desc',
    },
    include: {
      adicionais: true // 🔥 ESSENCIAL
    }
  })

  return produtos.map((p) => ({
    ...p,
    preco: Number(p.preco),
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
