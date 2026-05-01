import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

/**
 * 🔥 ADICIONAR CRÉDITO
 */
router.post("/:id/credito", async (req, res) => {
  const { id } = req.params;
  const { valor } = req.body;

  try {
    if (!valor || valor <= 0) {
      return res.status(400).json({
        message: "Valor inválido",
      });
    }

    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        credito: {
          increment: valor,
        },
      },
    });

    return res.json({
      success: true,
      data: cliente,
    });
  } catch (err) {
    console.error("Erro ao adicionar crédito:", err);
    return res.status(500).json({
      message: "Erro ao adicionar crédito",
    });
  }
});

/**
 * 🔥 LISTAR CLIENTES
 */
router.get("/", async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: { nome: "asc" },
    });

    return res.json({
      success: true,
      data: clientes,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Erro ao buscar clientes",
    });
  }
});

export default router;