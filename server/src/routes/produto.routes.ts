import { Router } from "express";
import produtoController from "../controllers/produto.controller";
import { ensureAuthenticated } from "../middlewares/auth.middleware";

const router = Router();

/*
=================================
ROTAS PÚBLICAS (CLIENTES)
=================================
*/

// GET /api/produtos
router.get("/", produtoController.listar);

// 🔥 CORREÇÃO AQUI
router.get("/:id", produtoController.buscarPorId);

/*
=================================
ROTAS PROTEGIDAS (ADMIN)
=================================
*/

// POST /api/produtos
router.post("/", ensureAuthenticated, produtoController.criar);

// PUT /api/produtos/:id
router.put("/:id", ensureAuthenticated, produtoController.atualizar);

// PATCH /api/produtos/:id/status
router.patch("/:id/status", ensureAuthenticated, produtoController.alterarStatus);

// DELETE /api/produtos/:id
router.delete("/:id", ensureAuthenticated, produtoController.deletar);

export default router;