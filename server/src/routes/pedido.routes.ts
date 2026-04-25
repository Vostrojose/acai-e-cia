import { Router } from "express";
import pedidoController from "../controllers/pedido.controller";
import { ensureAuthenticated } from "../middlewares/auth.middleware";
import { ensureAdmin } from "../middlewares/ensureAdmin";

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
 * 🔥 IMPORTANTE: rota dinâmica vem DEPOIS das fixas
 */

/**
 * Dashboard
 */
router.get("/dashboard", pedidoController.dashboard);

/**
 * Buscar pedido por ID
 */
router.get("/:id", pedidoController.buscarPorId);

/**
 * 🔐 Atualizar status (PROTEGIDO)
 */
router.patch(
  "/:id/status",
  ensureAuthenticated,
  ensureAdmin,
  pedidoController.atualizarStatus
);

export default router;