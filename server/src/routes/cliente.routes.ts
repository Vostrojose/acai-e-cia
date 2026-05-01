import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

/* ============================= */
/* 🔥 LISTAR CLIENTES            */
/* ============================= */
router.get("/", async (req, res) => {
  const clientes = await prisma.cliente.findMany({
    orderBy: { criadoEm: "desc" },
  });

  return res.json({
    success: true,
    data: clientes,
  });
});

/* ============================= */
/* 🔥 CRIAR CLIENTE              */
/* ============================= */
router.post("/", async (req, res) => {
  const { nome, credito } = req.body;

  if (!nome) {
    return res.status(400).json({
      message: "Nome é obrigatório",
    });
  }

  try {
    const cliente = await prisma.cliente.create({
      data: {
        nome: nome.toUpperCase().trim(),
        credito: credito || 0,
      },
    });

    return res.json({
      success: true,
      data: cliente,
    });
  } catch (err: any) {
    // 🔥 evita erro de nome duplicado
    if (err.code === "P2002") {
      return res.status(400).json({
        message: "Cliente já existe",
      });
    }

    console.error(err);

    return res.status(500).json({
      message: "Erro ao criar cliente",
    });
  }
});

/* ============================= */
/* 🔥 ADICIONAR CRÉDITO          */
/* ============================= */
router.post("/:id/credito", async (req, res) => {
  const { id } = req.params;
  const { valor } = req.body;

  await prisma.cliente.update({
    where: { id },
    data: {
      credito: {
        increment: valor,
      },
    },
  });

  return res.json({ success: true });
});

export default router;