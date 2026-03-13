"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../lib/prisma"));
class ProdutoService {
    async criarProduto(data) {
        return await prisma_1.default.produto.create({
            data: {
                nome: data.nome,
                descricao: data.descricao,
                preco: data.preco,
                ativo: data.ativo ?? true,
            },
        });
    }
    async listarProdutos() {
        return await prisma_1.default.produto.findMany({
            orderBy: {
                criadoEm: 'desc',
            },
        });
    }
    async alterarStatus(id, ativo) {
        return await prisma_1.default.produto.update({
            where: { id },
            data: { ativo },
        });
    }
    async removerProduto(id) {
        return await prisma_1.default.produto.delete({
            where: { id }
        });
    }
}
exports.default = new ProdutoService();
