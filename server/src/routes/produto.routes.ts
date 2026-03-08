import { Router } from "express";
import produtoController from "../controllers/produto.controller";
import { ensureAuthenticated } from "../middlewares/auth.middleware";

const router = Router();

// 🔓 Público (clientes podem listar produtos)
router.get("/produtos", produtoController.listar);

// 🔐 Apenas admin autenticado
router.post("/produtos", ensureAuthenticated, produtoController.criar);
router.put("/produtos/:id", ensureAuthenticated, produtoController.atualizar);
router.patch("/produtos/:id/status", ensureAuthenticated, produtoController.alterarStatus);
router.delete("/produtos/:id", ensureAuthenticated, produtoController.deletar);

export default router;