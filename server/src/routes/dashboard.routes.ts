import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const pedidos = await prisma.pedido.findMany();

    const totalVendas = pedidos.reduce(
      (acc, p) => acc + Number(p.total),
      0
    );

    const totalFiado = pedidos
      .filter((p) => !p.pago)
      .reduce((acc, p) => acc + Number(p.total), 0);

    const totalPago = pedidos
      .filter((p) => p.pago)
      .reduce((acc, p) => acc + Number(p.total), 0);

    const totalCredito = pedidos
      .filter((p) => p.formaPagamentoBalcao === "CREDITO")
      .reduce((acc, p) => acc + Number(p.total), 0);

    return res.json({
      success: true,
      data: {
        totalVendas,
        totalPago,
        totalFiado,
        totalCredito,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Erro no dashboard",
    });
  }
});

export default router;