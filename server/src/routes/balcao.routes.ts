import { Router } from "express";
import balcaoController from "../controllers/balcao.controller";

const router = Router();

/* ============================= */
/* VENDAS BALCÃO (SEM LOGIN)     */
/* ============================= */

router.post(
  "/",
  balcaoController.criar
);

export default router;