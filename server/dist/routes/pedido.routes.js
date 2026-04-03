import { Router } from "express";
import pedidoController from "../controllers/pedido.controller";
const router = Router();
/**
 * Criar novo pedido
 * POST /api/pedido
 */
router.post("/", pedidoController.criar);
/**
 * Listar todos os pedidos
 * GET /api/pedido
 */
router.get("/", pedidoController.listar);
/**
 * Atualizar status de um pedido
 * PATCH /api/pedido/:id/status
 */
router.patch("/:id/status", pedidoController.atualizarStatus);
/**
 * Dashboard de pedidos
 * GET /api/pedido/dashboard
 */
router.get("/dashboard", pedidoController.dashboard);
export default router;
