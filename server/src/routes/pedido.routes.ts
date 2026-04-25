import { Router } from "express";
import pedidoController from "../controllers/pedido.controller";

const router = Router();

/**
 * Criar novo pedido (cliente)
 */
router.post("/", pedidoController.criar);

/**
 * Listar pedidos (cozinha)
 */
router.get("/", pedidoController.listar);

/**
 * Dashboard (livre)
 * 🔥 IMPORTANTE: rota fixa vem antes da dinâmica
 */
router.get("/dashboard", pedidoController.dashboard);

/**
 * Buscar pedido por ID (livre)
 */
router.get("/:id", pedidoController.buscarPorId);

/**
 * 🔥 COZINHA ALTERA STATUS (SEM LOGIN)
 */
router.patch("/:id/status", pedidoController.atualizarStatus);

export default router;