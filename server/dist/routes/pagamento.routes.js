"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const PaymentProvider_1 = __importDefault(require("../services/payment/PaymentProvider"));
const pedido_service_1 = __importDefault(require("../services/pedido.service"));
const client_1 = require("@prisma/client");
const AppError_1 = require("../utils/AppError");
const socket_1 = require("../websocket/socket");
const router = (0, express_1.Router)();
/* ============================= */
/* SCHEMA CHECKOUT               */
/* ============================= */
const pagamentoSchema = zod_1.z.object({
    pedidoId: zod_1.z.string().uuid(),
});
/* ============================= */
/* SCHEMA WEBHOOK                */
/* ============================= */
const webhookSchema = zod_1.z.object({
    type: zod_1.z.string().optional(),
    data: zod_1.z
        .object({
        id: zod_1.z.string(),
    })
        .optional(),
});
/* ============================= */
/* CRIAR CHECKOUT (PREFERENCE)   */
/* ============================= */
router.post('/pagamento/checkout', async (req, res) => {
    try {
        const { pedidoId } = pagamentoSchema.parse(req.body);
        const pedido = await pedido_service_1.default.buscarPorIdComProdutos(pedidoId);
        if (!pedido) {
            throw new AppError_1.AppError('Pedido não encontrado.', 404);
        }
        if (pedido.status !== client_1.StatusPedido.RECEBIDO) {
            throw new AppError_1.AppError('Pagamento só pode ser realizado para pedidos RECEBIDO.', 400);
        }
        const checkout = await PaymentProvider_1.default.criarCheckoutPreference(pedido);
        return res.status(200).json({
            success: true,
            data: checkout,
        });
    }
    catch (error) {
        console.error('🔥 ERRO CHECKOUT:', error);
        if (error instanceof AppError_1.AppError) {
            return res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Erro ao gerar checkout.',
        });
    }
});
/* ============================= */
/* WEBHOOK MERCADO PAGO          */
/* ============================= */
router.post('/pagamento/webhook', async (req, res) => {
    try {
        const parsed = webhookSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.sendStatus(200);
        }
        const paymentId = parsed.data.data?.id;
        if (!paymentId) {
            return res.sendStatus(200);
        }
        const pagamento = await PaymentProvider_1.default.buscarPagamento(paymentId);
        if (!pagamento) {
            return res.sendStatus(200);
        }
        if (pagamento.status !== 'approved') {
            return res.sendStatus(200);
        }
        // 🔐 PROTEÇÃO contra external_reference null
        if (!pagamento.pedidoId) {
            console.error('Pagamento sem external_reference');
            return res.sendStatus(200);
        }
        const pedido = await pedido_service_1.default.buscarPorId(pagamento.pedidoId);
        if (!pedido) {
            return res.sendStatus(200);
        }
        // 🔐 Validação de valor
        if (Number(pedido.total) !== Number(pagamento.transaction_amount)) {
            console.error('🚨 Divergência de valor detectada');
            return res.sendStatus(200);
        }
        // 🔐 Só processa se ainda RECEBIDO
        if (pedido.status !== client_1.StatusPedido.RECEBIDO) {
            return res.sendStatus(200);
        }
        const pedidoAtualizado = await pedido_service_1.default.atualizarStatus(pedido.id, client_1.StatusPedido.RECEBIDO);
        // 🔌 WebSocket opcional
        try {
            (0, socket_1.getIO)().emit('pedido_atualizado', {
                id: pedidoAtualizado.id,
                status: pedidoAtualizado.status,
                total: pedidoAtualizado.total,
            });
        }
        catch {
            console.warn('⚠️ WebSocket não inicializado.');
        }
        return res.sendStatus(200);
    }
    catch (error) {
        console.error('🔥 ERRO WEBHOOK:', error);
        return res.sendStatus(200);
    }
});
exports.default = router;
