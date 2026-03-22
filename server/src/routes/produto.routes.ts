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

router.get("/produtos", produtoController.listar);


/*
=================================
ROTAS PROTEGIDAS (ADMIN)
=================================
Apenas usuários autenticados podem criar,
editar, alterar status ou remover produtos
*/

router.post(
  "/produtos",
  ensureAuthenticated,
  produtoController.criar
);

router.put(
  "/produtos/:id",
  ensureAuthenticated,
  produtoController.atualizar
);

router.patch(
  "/produtos/:id/status",
  ensureAuthenticated,
  produtoController.alterarStatus
);

router.delete(
  "/produtos/:id",
  ensureAuthenticated,
  produtoController.deletar
);


/*
=================================
EXPORTAÇÃO DAS ROTAS
=================================
*/

export default router;