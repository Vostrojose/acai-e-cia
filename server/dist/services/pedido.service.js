"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../lib/prisma"));
const AppError_1 = require("../utils/AppError");
const socket_1 = require("../websocket/socket");
class PedidoService {
    /* ============================= */
    /* CRIAR PEDIDO (BLINDADO) */
    /* ============================= */
    async criarPedido(data) {
        if (!data.itens || data.itens.length === 0) {
            throw new AppError_1.AppError('Pedido precisa conter ao menos um item.', 400);
        }
        // 🔒 Buscar todos os produtos válidos e ativos
        const produtosIds = data.itens.map((item) => item.produtoId);
        const produtos = await prisma_1.default.produto.findMany({
            where: {
                id: { in: produtosIds },
                ativo: true,
            },
        });
        if (produtos.length !== produtosIds.length) {
            throw new AppError_1.AppError('Um ou mais produtos são inválidos ou estão inativos.', 400);
        }
        const produtosMap = new Map(produtos.map((p) => [p.id, p]));
        let totalCalculado = 0;
        const itensParaCriar = data.itens.map((item) => {
            if (!Number.isInteger(item.quantidade) || item.quantidade <= 0) {
                throw new AppError_1.AppError('Quantidade inválida.', 400);
            }
            const produto = produtosMap.get(item.produtoId);
            if (!produto) {
                throw new AppError_1.AppError('Produto não encontrado.', 400);
            }
            const subtotal = produto.preco * item.quantidade;
            totalCalculado += subtotal;
            return {
                produtoId: produto.id,
                quantidade: item.quantidade,
                precoUnit: produto.preco, // 🔒 preço sempre vindo do banco
            };
        });
        // 🔐 Transação atômica para garantir consistência
        const pedidoCriado = await prisma_1.default.$transaction(async (tx) => {
            return await tx.pedido.create({
                data: {
                    total: totalCalculado, // 🔒 total recalculado no backend
                    telefone: data.telefone,
                    itens: {
                        create: itensParaCriar,
                    },
                },
                include: {
                    itens: true,
                },
            });
        });
        // 🔌 Emitir evento WebSocket (dados mínimos necessários)
        try {
            const io = (0, socket_1.getIO)();
            io.emit('novo_pedido', {
                id: pedidoCriado.id,
                status: pedidoCriado.status,
                total: pedidoCriado.total,
                criadoEm: pedidoCriado.criadoEm,
            });
        }
        catch (error) {
            console.warn('⚠️ WebSocket ainda não inicializado.');
        }
        return pedidoCriado;
    }
    /* ============================= */
    /* ATUALIZAR STATUS */
    /* ============================= */
    async atualizarStatus(id, novoStatus) {
        const pedido = await prisma_1.default.pedido.findUnique({
            where: { id },
        });
        if (!pedido) {
            throw new AppError_1.AppError('Pedido não encontrado.', 404);
        }
        const statusAtual = pedido.status;
        const regras = {
            RECEBIDO: ['EM_PREPARO', 'CANCELADO'],
            EM_PREPARO: ['PRONTO', 'CANCELADO'],
            PRONTO: ['ENTREGUE'],
            ENTREGUE: [],
            CANCELADO: [],
        };
        const transicoesPermitidas = regras[statusAtual];
        if (!transicoesPermitidas.includes(novoStatus)) {
            throw new AppError_1.AppError(`Transição inválida de ${statusAtual} para ${novoStatus}.`, 400);
        }
        const pedidoAtualizado = await prisma_1.default.pedido.update({
            where: { id },
            data: { status: novoStatus },
            include: {
                itens: true,
            },
        });
        try {
            const io = (0, socket_1.getIO)();
            io.emit('pedido_atualizado', pedidoAtualizado);
        }
        catch (error) {
            console.warn('⚠️ WebSocket ainda não inicializado.');
        }
        return pedidoAtualizado;
    }
    /* ============================= */
    /* LISTAR PEDIDOS (COM FILTRO) */
    /* ============================= */
    async listarPedidos(status) {
        const where = status
            ? { status: status }
            : undefined;
        return await prisma_1.default.pedido.findMany({
            where,
            include: {
                itens: true,
            },
            orderBy: {
                criadoEm: 'desc',
            },
        });
    }
    async buscarPorId(id) {
        return prisma_1.default.pedido.findUnique({
            where: { id },
            include: {
                itens: true,
            },
        });
    }
    /* ============================= */
    /* DASHBOARD */
    /* ============================= */
    async dashboardPedidos() {
        const pedidos = await prisma_1.default.pedido.groupBy({
            by: ['status'],
            _count: {
                status: true,
            },
        });
        const base = {
            RECEBIDO: 0,
            EM_PREPARO: 0,
            PRONTO: 0,
            ENTREGUE: 0,
            CANCELADO: 0,
        };
        pedidos.forEach((item) => {
            base[item.status] = item._count.status;
        });
        const total = Object.values(base).reduce((acc, curr) => acc + curr, 0);
        return {
            ...base,
            TOTAL: total,
        };
    }
}
exports.default = new PedidoService();
