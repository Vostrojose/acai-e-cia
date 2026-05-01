import { Router } from "express";
import pedidoController from "../controllers/pedido.controller";
import prisma from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { serializeDecimal } from "../utils/serializeDecimal";

const router = Router();

/**
 * Criar novo pedido (cliente)
 */
router.post("/", pedidoController.criar);

/**
 * Listar pedidos (cozinha)
 * 🔥 MANTIDO ORIGINAL (NÃO ALTERADO)
 */
router.get("/", pedidoController.listar);

/**
 * 🔥 LISTAR FIADOS (VERSÃO PRODUÇÃO)
 */
router.get(
  "/fiados",
  asyncHandler(async (req, res) => {
    const pedidos = await prisma.pedido.findMany({
      where: {
        pago: false,
      },
      orderBy: {
        criadoEm: "desc",
      },
      include: {
        itens: {
          include: {
            adicionais: true,
          },
        },
        cliente: true,
      },
    });

    return res.json({
      success: true,
      data: serializeDecimal(pedidos),
    });
  })
);

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

/**
 * 🔥 MARCAR COMO PAGO (FIADO)
 */
router.patch(
  "/:id/pagar",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    await prisma.pedido.update({
      where: { id },
      data: { pago: true },
    });

    return res.json({ success: true });
  })
);

export default router;
