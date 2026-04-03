import { Router } from "express";
import pedidoController from "../controllers/pedido.controller";

const router = Router();

/**
 * Criar novo pedido
 * POST /api/pedidos
 */
router.post("/", pedidoController.criar);

/**
 * Listar todos os pedidos
 * GET /api/pedidos
 */
router.get("/", pedidoController.listar);

/**
 * Atualizar status de um pedido
 * PATCH /api/pedidos/:id/status
 */
router.patch("/:id/status", pedidoController.atualizarStatus);

/**
 * Dashboard de pedidos
 * GET /api/pedidos/dashboard
 */
router.get("/dashboard", pedidoController.dashboard);

export default router;