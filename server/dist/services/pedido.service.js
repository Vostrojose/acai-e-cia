import prisma from '../lib/prisma';
import { StatusPedido } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { getIO } from '../websocket/socket';
class PedidoService {
    /* ============================= */
    /* CRIAR PEDIDO (BLINDADO) */
    /* ============================= */
    async criarPedido(data) {
        /* ---------- valida itens ---------- */
        if (!Array.isArray(data.itens) || data.itens.length === 0) {
            throw new AppError('Pedido precisa conter ao menos um item.', 400);
        }
        /* ---------- proteção contra duplicação ---------- */
        const idsDuplicados = new Set();
        data.itens.forEach((i) => {
            if (idsDuplicados.has(i.produtoId)) {
                throw new AppError('Produto duplicado no pedido.', 400);
            }
            idsDuplicados.add(i.produtoId);
        });
        /* ---------- valida quantidade ---------- */
        data.itens.forEach((item) => {
            if (!item.produtoId || item.produtoId.length < 10) {
                throw new AppError('produtoId inválido.', 400);
            }
            if (!Number.isInteger(item.quantidade) || item.quantidade <= 0) {
                throw new AppError('Quantidade inválida.', 400);
            }
            if (item.quantidade > 50) {
                throw new AppError('Quantidade máxima por item excedida.', 400);
            }
        });
        /* ---------- normaliza telefone ---------- */
        let telefoneLimpo;
        if (data.telefone) {
            telefoneLimpo = data.telefone.replace(/\D/g, '');
            if (telefoneLimpo.length < 10 || telefoneLimpo.length > 15) {
                throw new AppError('Telefone inválido.', 400);
            }
        }
        /* ---------- busca produtos ---------- */
        const produtosIds = data.itens.map((i) => i.produtoId);
        const produtos = await prisma.produto.findMany({
            where: {
                id: { in: produtosIds },
                ativo: true,
            },
        });
        if (produtos.length !== produtosIds.length) {
            throw new AppError('Um ou mais produtos são inválidos ou estão inativos.', 400);
        }
        const produtosMap = new Map(produtos.map((p) => [p.id, p]));
        /* ---------- recalcula total ---------- */
        let totalCalculado = 0;
        const itensParaCriar = data.itens.map((item) => {
            const produto = produtosMap.get(item.produtoId);
            if (!produto) {
                throw new AppError('Produto não encontrado.', 400);
            }
            const subtotal = produto.preco * item.quantidade;
            if (!Number.isFinite(subtotal)) {
                throw new AppError('Erro no cálculo do pedido.', 400);
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
            throw new AppError('Total do pedido inválido.', 400);
        }
        if (totalCalculado > 10000) {
            throw new AppError('Total do pedido excede limite permitido.', 400);
        }
        /* ---------- cria pedido ---------- */
        const pedidoCriado = await prisma.$transaction(async (tx) => {
            const pedido = await tx.pedido.create({
                data: {
                    total: totalCalculado,
                    telefone: data.telefone,
                    origem: data.origem,
                    endereco: data.endereco,
                    status: StatusPedido.AGUARDANDO_PAGAMENTO,
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
            if (pedidoCriado.status === StatusPedido.RECEBIDO) {
                const io = getIO();
                io.emit('novo_pedido', {
                    id: pedidoCriado.id,
                    status: pedidoCriado.status,
                    total: pedidoCriado.total,
                    criadoEm: pedidoCriado.criadoEm,
                });
            }
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
        return prisma.pedido.findUnique({
            where: { id },
            include: { itens: true },
        });
    }
    /* ============================= */
    /* BUSCAR PEDIDO COM PRODUTOS */
    /* ============================= */
    async buscarPorIdComProdutos(id) {
        return prisma.pedido.findUnique({
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
        const pedido = await prisma.pedido.findUnique({
            where: { id },
        });
        if (!pedido) {
            throw new AppError('Pedido não encontrado.', 404);
        }
        const regras = {
            AGUARDANDO_PAGAMENTO: ['RECEBIDO', 'CANCELADO'],
            RECEBIDO: ['EM_PREPARO', 'CANCELADO'],
            EM_PREPARO: ['PRONTO', 'CANCELADO'],
            PRONTO: ['ENTREGUE'],
            ENTREGUE: [],
            CANCELADO: [],
        };
        const permitidos = regras[pedido.status];
        if (!permitidos.includes(novoStatus)) {
            throw new AppError(`Transição inválida de ${pedido.status} para ${novoStatus}.`, 400);
        }
        const pedidoAtualizado = await prisma.pedido.update({
            where: { id },
            data: { status: novoStatus },
            include: { itens: true },
        });
        try {
            const io = getIO();
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
        return prisma.pedido.findMany({
            where,
            include: { itens: true },
            orderBy: { criadoEm: 'desc' },
        });
    }
    /* ============================= */
    /* DASHBOARD */
    /* ============================= */
    async dashboardPedidos() {
        const pedidos = await prisma.pedido.groupBy({
            by: ['status'],
            _count: { status: true },
        });
        const base = {
            AGUARDANDO_PAGAMENTO: 0,
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
export default new PedidoService();
