"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pedido_controller_1 = __importDefault(require("../controllers/pedido.controller"));
const router = (0, express_1.Router)();
router.post('/pedido', pedido_controller_1.default.criar);
router.get('/pedidos', pedido_controller_1.default.listar);
router.patch('/pedido/:id/status', pedido_controller_1.default.atualizarStatus);
router.get('/dashboard/pedidos', pedido_controller_1.default.dashboard);
exports.default = router;
