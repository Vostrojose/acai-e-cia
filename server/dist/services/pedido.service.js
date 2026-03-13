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
        /* ---------- valida itens ---------- */
        if (!Array.isArray(data.itens) || data.itens.length === 0) {
            throw new AppError_1.AppError('Pedido precisa conter ao menos um item.', 400);
        }
        /* ---------- proteção contra duplicação ---------- */
        const idsDuplicados = new Set();
        data.itens.forEach((i) => {
            if (idsDuplicados.has(i.produtoId)) {
                throw new AppError_1.AppError('Produto duplicado no pedido.', 400);
            }
            idsDuplicados.add(i.produtoId);
        });
        /* ---------- valida quantidade ---------- */
        data.itens.forEach((item) => {
            if (!item.produtoId || item.produtoId.length < 10) {
                throw new AppError_1.AppError('produtoId inválido.', 400);
            }
            if (!Number.isInteger(item.quantidade) || item.quantidade <= 0) {
                throw new AppError_1.AppError('Quantidade inválida.', 400);
            }
            if (item.quantidade > 50) {
                throw new AppError_1.AppError('Quantidade máxima por item excedida.', 400);
            }
        });
        /* ---------- normaliza telefone ---------- */
        let telefoneLimpo;
        if (data.telefone) {
            telefoneLimpo = data.telefone.replace(/\D/g, '');
            if (telefoneLimpo.length < 10 || telefoneLimpo.length > 15) {
                throw new AppError_1.AppError('Telefone inválido.', 400);
            }
        }
        /* ---------- busca produtos ---------- */
        const produtosIds = data.itens.map((i) => i.produtoId);
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
        /* ---------- recalcula total ---------- */
        let totalCalculado = 0;
        const itensParaCriar = data.itens.map((item) => {
            const produto = produtosMap.get(item.produtoId);
            if (!produto) {
                throw new AppError_1.AppError('Produto não encontrado.', 400);
            }
            const subtotal = produto.preco * item.quantidade;
            if (!Number.isFinite(subtotal)) {
                throw new AppError_1.AppError('Erro no cálculo do pedido.', 400);
            }
            totalCalculado += subtotal;
            return {
                produtoId: produto.id,
                quantidade: item.quantidade,
                precoUnit: produto.preco,
            };
        });
        /* ---------- valida total ---------- */
        if (totalCalculado <= 0) {
            throw new AppError_1.AppError('Total do pedido inválido.', 400);
        }
        if (totalCalculado > 10000) {
            throw new AppError_1.AppError('Total do pedido excede limite permitido.', 400);
        }
        /* ---------- cria pedido ---------- */
        const pedidoCriado = await prisma_1.default.$transaction(async (tx) => {
            const pedido = await tx.pedido.create({
                data: {
                    total: totalCalculado,
                    telefone: data.telefone,
                    origem: data.origem,
                    endereco: data.endereco,
                    itens: {
                        create: itensParaCriar,
                    },
                },
                include: {
                    itens: true,
                },
            });
            return pedido;
        });
        /* ---------- websocket ---------- */
        try {
            const io = (0, socket_1.getIO)();
            io.emit('novo_pedido', {
                id: pedidoCriado.id,
                status: pedidoCriado.status,
                total: pedidoCriado.total,
                criadoEm: pedidoCriado.criadoEm,
            });
        }
        catch {
            console.warn('⚠️ WebSocket ainda não inicializado.');
        }
        return pedidoCriado;
    }
    /* ============================= */
    /* BUSCAR PEDIDO POR ID */
    /* ============================= */
    async buscarPorId(id) {
        return prisma_1.default.pedido.findUnique({
            where: { id },
            include: { itens: true },
        });
    }
    /* ============================= */
    /* BUSCAR PEDIDO COM PRODUTOS */
    /* ============================= */
    async buscarPorIdComProdutos(id) {
        return prisma_1.default.pedido.findUnique({
            where: { id },
            include: {
                itens: {
                    include: {
                        produto: true,
                    },
                },
            },
        });
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
        const regras = {
            RECEBIDO: ['EM_PREPARO', 'CANCELADO'],
            EM_PREPARO: ['PRONTO', 'CANCELADO'],
            PRONTO: ['ENTREGUE'],
            ENTREGUE: [],
            CANCELADO: [],
        };
        const permitidos = regras[pedido.status];
        if (!permitidos.includes(novoStatus)) {
            throw new AppError_1.AppError(`Transição inválida de ${pedido.status} para ${novoStatus}.`, 400);
        }
        const pedidoAtualizado = await prisma_1.default.pedido.update({
            where: { id },
            data: { status: novoStatus },
            include: { itens: true },
        });
        try {
            const io = (0, socket_1.getIO)();
            io.emit('pedido_atualizado', pedidoAtualizado);
        }
        catch {
            console.warn('⚠️ WebSocket ainda não inicializado.');
        }
        return pedidoAtualizado;
    }
    /* ============================= */
    /* LISTAR PEDIDOS */
    /* ============================= */
    async listarPedidos(status) {
        const where = status ? { status: status } : undefined;
        return prisma_1.default.pedido.findMany({
            where,
            include: { itens: true },
            orderBy: { criadoEm: 'desc' },
        });
    }
    /* ============================= */
    /* DASHBOARD */
    /* ============================= */
    async dashboardPedidos() {
        const pedidos = await prisma_1.default.pedido.groupBy({
            by: ['status'],
            _count: { status: true },
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
