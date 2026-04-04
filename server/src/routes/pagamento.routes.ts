import { Router } from "express";
import { z } from "zod";
import PaymentProvider from "../services/payment/PaymentProvider";
import PedidoService from "../services/pedido.service";
import { StatusPedido } from "@prisma/client";
import { AppError } from "../utils/AppError";
import { getIO } from "../websocket/socket";

const router = Router();

/* ============================= */
/* SCHEMAS                       */
/* ============================= */

const pagamentoSchema = z.object({
  pedidoId: z.string().uuid(),
});

const webhookSchema = z.object({
  type: z.string().optional(),
  data: z
    .object({
      id: z.union([z.string(), z.number()]),
    })
    .optional(),
});

/* ============================= */
/* PIX                           */
/* ============================= */
// POST /api/pagamento/pix

router.post("/pix", async (req, res) => {
  try {
    const { pedidoId } = pagamentoSchema.parse(req.body);

    const pedido = await PedidoService.buscarPorIdComProdutos(pedidoId);

    if (!pedido) {
      throw new AppError("Pedido não encontrado.", 404);
    }

    const resultado = await PaymentProvider.criarPagamentoPix(pedido);

    return res.json({
      success: true,
      data: resultado,
    });

  } catch (error: any) {
    console.error("ERRO PIX:", error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Erro ao gerar pagamento PIX",
    });
  }
});

/* ============================= */
/* CHECKOUT                      */
/* ============================= */
// POST /api/pagamento/checkout

router.post("/checkout", async (req, res) => {
  try {
    const { pedidoId } = pagamentoSchema.parse(req.body);

    const pedido = await PedidoService.buscarPorIdComProdutos(pedidoId);

    if (!pedido) {
      throw new AppError("Pedido não encontrado.", 404);
    }

    if (pedido.status !== StatusPedido.AGUARDANDO_PAGAMENTO) {
      throw new AppError(
        "Pagamento só pode ser realizado para pedidos aguardando pagamento.",
        400
      );
    }

    const checkout = await PaymentProvider.criarCheckoutPreference(pedido);

    return res.status(200).json({
      success: true,
      data: {
        init_point: checkout.init_point,
      },
    });

  } catch (error: any) {
    console.error("ERRO CHECKOUT:", error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Erro ao gerar checkout.",
    });
  }
});

/* ============================= */
/* WEBHOOK MERCADO PAGO          */
/* ============================= */
// POST /api/pagamento/webhook

router.post("/webhook", async (req, res) => {
  try {
    const parsed = webhookSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.sendStatus(200);
    }

    const paymentId = parsed.data.data?.id?.toString();

    if (!paymentId) {
      return res.sendStatus(200);
    }

    const pagamento = await PaymentProvider.buscarPagamento(paymentId);

    if (!pagamento) {
      return res.sendStatus(200);
    }

    if (pagamento.status !== "approved") {
      return res.sendStatus(200);
    }

    if (!pagamento.pedidoId) {
      console.error("Pagamento sem external_reference");
      return res.sendStatus(200);
    }

    const pedido = await PedidoService.buscarPorId(pagamento.pedidoId);

    if (!pedido) {
      return res.sendStatus(200);
    }

    if (Number(pedido.total) !== Number(pagamento.transaction_amount)) {
      console.error("Divergência de valor detectada");
      return res.sendStatus(200);
    }

    if (pedido.status !== StatusPedido.AGUARDANDO_PAGAMENTO) {
      return res.sendStatus(200);
    }

    const pedidoAtualizado = await PedidoService.atualizarStatus(
      pedido.id,
      StatusPedido.RECEBIDO
    );

    try {
      const io = getIO();
      io.emit("novo_pedido", pedidoAtualizado);
      io.emit("pedido_atualizado", pedidoAtualizado);
    } catch {
      console.warn("WebSocket não inicializado.");
    }

    return res.sendStatus(200);

  } catch (error) {
    console.error("ERRO WEBHOOK:", error);
    return res.sendStatus(200);
  }
});

export default router;