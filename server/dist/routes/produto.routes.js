"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const produto_controller_1 = __importDefault(require("../controllers/produto.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// 🔓 Público (clientes podem listar produtos)
router.get("/produtos", produto_controller_1.default.listar);
// 🔐 Apenas admin autenticado
router.post("/produtos", auth_middleware_1.ensureAuthenticated, produto_controller_1.default.criar);
router.put("/produtos/:id", auth_middleware_1.ensureAuthenticated, produto_controller_1.default.atualizar);
router.patch("/produtos/:id/status", auth_middleware_1.ensureAuthenticated, produto_controller_1.default.alterarStatus);
router.delete("/produtos/:id", auth_middleware_1.ensureAuthenticated, produto_controller_1.default.deletar);
exports.default = router;
