import prisma from '../lib/prisma';
class ProdutoService {
    async criarProduto(data) {
        return await prisma.produto.create({
            data: {
                nome: data.nome,
                descricao: data.descricao,
                preco: data.preco,
                ativo: data.ativo ?? true,
            },
        });
    }
    async listarProdutos() {
        return await prisma.produto.findMany({
            orderBy: {
                criadoEm: 'desc',
            },
        });
    }
    async alterarStatus(id, ativo) {
        return await prisma.produto.update({
            where: { id },
            data: { ativo },
        });
    }
    async removerProduto(id) {
        return await prisma.produto.delete({
            where: { id }
        });
    }
}
export default new ProdutoService();
