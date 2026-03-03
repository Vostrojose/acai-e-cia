"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const pedido_service_1 = __importDefault(require("../services/pedido.service"));
const asyncHandler_1 = require("../utils/asyncHandler");
const pedido_status_schema_1 = require("../validators/pedido-status.schema");
const pedido_schema_1 = require("../validators/pedido.schema");
const socket_1 = require("../websocket/socket");
const notification_1 = require("../services/notification");
class PedidoController {
    /* ============================= */
    /* CRIAR */
    /* ============================= */
    criar = (0, asyncHandler_1.asyncHandler)(async (request, response) => {
        const data = pedido_schema_1.criarPedidoSchema.parse(request.body);
        const pedido = await pedido_service_1.default.criarPedido(data);
        return response.status(201).json({
            success: true,
            data: pedido,
        });
    });
    /* ============================= */
    /* LISTAR */
    /* ============================= */
    listar = (0, asyncHandler_1.asyncHandler)(async (request, response) => {
        const { status } = request.query;
        const pedidos = await pedido_service_1.default.listarPedidos(status);
        return response.json({
            success: true,
            data: pedidos,
        });
    });
    /* ============================= */
    /* ATUALIZAR STATUS */
    /* ============================= */
    atualizarStatus = (0, asyncHandler_1.asyncHandler)(async (request, response) => {
        const { id } = request.params;
        const data = pedido_status_schema_1.atualizarStatusSchema.parse(request.body);
        const pedido = await pedido_service_1.default.atualizarStatus(id, data.status);
        // 🔔 Atualização em tempo real
        (0, socket_1.getIO)().emit('pedido_atualizado', pedido);
        // 📲 Notificação quando estiver PRONTO
        if (pedido.status === client_1.StatusPedido.PRONTO && pedido.telefone) {
            await notification_1.NotificationService.enviarMensagem(pedido.telefone, '🍧 Seu pedido está PRONTO para retirada!');
        }
        return response.json({
            success: true,
            data: pedido,
        });
    });
    /* ============================= */
    /* DASHBOARD */
    /* ============================= */
    dashboard = (0, asyncHandler_1.asyncHandler)(async (_request, response) => {
        const data = await pedido_service_1.default.dashboardPedidos();
        return response.json({
            success: true,
            data,
        });
    });
}
exports.default = new PedidoController();
