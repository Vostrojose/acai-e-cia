import { Router } from "express";
import balcaoController from "../controllers/balcao.controller";

const router = Router();

/* =================================
   💰 VENDA BALCÃO
================================= */
router.post("/", balcaoController.criar);

export default router;