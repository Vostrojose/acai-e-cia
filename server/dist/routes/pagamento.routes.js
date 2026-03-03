"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PaymentProvider_1 = __importDefault(require("../services/payment/PaymentProvider"));
const pedido_service_1 = __importDefault(require("../services/pedido.service"));
const client_1 = require("@prisma/client");
const socket_1 = require("../websocket/socket");
const router = (0, express_1.Router)();
router.post('/pagamento/pix', async (req, res) => {
    const { pedidoId } = req.body;
    if (!pedidoId) {
        return res.status(400).json({
            success: false,
            message: 'pedidoId é obrigatório',
        });
    }
    try {
        // 🔹 Buscar pedido no banco
        const pedido = await pedido_service_1.default.buscarPorId(pedidoId);
        if (!pedido) {
            return res.status(404).json({
                success: false,
                message: 'Pedido não encontrado',
            });
        }
        // 🔹 Criar pagamento usando TOTAL REAL DO PEDIDO
        const pagamento = await PaymentProvider_1.default.criarPagamentoPix(pedidoId, pedido.total);
        // 🔔 Se aprovado, muda para EM_PREPARO
        if (pagamento.status === 'approved' && pedido.status === 'RECEBIDO') {
            const pedidoAtualizado = await pedido_service_1.default.atualizarStatus(pedidoId, client_1.StatusPedido.EM_PREPARO);
            (0, socket_1.getIO)().emit('pedido_atualizado', pedidoAtualizado);
        }
        return res.json({
            success: true,
            data: pagamento,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao processar pagamento',
        });
    }
});
exports.default = router;
