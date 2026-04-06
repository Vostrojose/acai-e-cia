import { Router } from "express";
import { PrismaClient } from "@prisma/client";
console.log("🔥 ROTA SIMULAÇÃO CARREGADA");

const prisma = new PrismaClient(); // 🔥 isolado só pra teste

const router = Router();

router.post("/simular", async (req, res) => {
  try {
    const { pedidoId } = req.body;

    if (!pedidoId) {
      return res.status(400).json({ error: "pedidoId é obrigatório" });
    }

    console.log("🔔 SIMULAÇÃO (ISOLADA):", pedidoId);

    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
    });

    if (!pedido) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    const atualizado = await prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        status: "RECEBIDO",
      },
    });

    console.log("✅ SIMULAÇÃO OK:", atualizado.id);

    return res.json({
      success: true,
      pedido: atualizado,
    });

  } catch (error) {
    console.error("❌ ERRO SIMULAÇÃO:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
});

export default router;