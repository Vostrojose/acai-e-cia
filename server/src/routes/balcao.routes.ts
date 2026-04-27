import { Router } from "express";
import { ensureAuthenticated } from "../middlewares/auth.middleware";
import { ensureAdmin } from "../middlewares/ensureAdmin";
import balcãoController from "../controllers/balcao.controller";

const router = Router();

router.post(
  "/",
  ensureAuthenticated,
  ensureAdmin,
  balcãoController.criar
);

export default router;