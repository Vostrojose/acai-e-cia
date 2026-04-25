import { Router } from "express";
import produtoController from "../controllers/produto.controller";
import { ensureAuthenticated } from "../middlewares/auth.middleware";
import { ensureAdmin } from "../middlewares/ensureAdmin";

const router = Router();

/*
=================================
ROTAS PÚBLICAS (CLIENTES)
=================================
*/

// Listar produtos
router.get("/", produtoController.listar);

// Buscar produto por ID
router.get("/:id", produtoController.buscarPorId);

/*
=================================
ROTAS PROTEGIDAS (ADMIN)
=================================
*/

// Criar produto
router.post(
  "/",
  ensureAuthenticated,
  ensureAdmin,
  produtoController.criar
);

// Atualizar produto
router.put(
  "/:id",
  ensureAuthenticated,
  ensureAdmin,
  produtoController.atualizar
);

// Alterar status
router.patch(
  "/:id/status",
  ensureAuthenticated,
  ensureAdmin,
  produtoController.alterarStatus
);

// Deletar produto
router.delete(
  "/:id",
  ensureAuthenticated,
  ensureAdmin,
  produtoController.deletar
);

export default router;