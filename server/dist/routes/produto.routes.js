import { Router } from "express";
import produtoController from "../controllers/produto.controller";
import { ensureAuthenticated } from "../middlewares/auth.middleware";
const router = Router();
/*
=================================
ROTAS PÚBLICAS (CLIENTES)
=================================
Clientes podem listar os produtos disponíveis no cardápio
*/
// GET /api/produtos
router.get("/", produtoController.listar);
/*
=================================
ROTAS PROTEGIDAS (ADMIN)
=================================
Apenas usuários autenticados podem criar,
editar, alterar status ou remover produtos
*/
// POST /api/produtos
router.post("/", ensureAuthenticated, produtoController.criar);
// PUT /api/produtos/:id
router.put("/:id", ensureAuthenticated, produtoController.atualizar);
// PATCH /api/produtos/:id/status
router.patch("/:id/status", ensureAuthenticated, produtoController.alterarStatus);
// DELETE /api/produtos/:id
router.delete("/:id", ensureAuthenticated, produtoController.deletar);
/*
=================================
EXPORTAÇÃO DAS ROTAS
=================================
*/
export default router;
