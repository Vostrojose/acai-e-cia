import { Router } from "express";
import { z } from "zod";
import PaymentProvider from "../services/payment/PaymentProvider";
import PedidoService from "../services/pedido.service";
import { StatusPedido } from "@prisma/client";
import { AppError } from "../utils/AppError";
import { getIO } from "../websocket/socket";

const router = Router();

/* ============================= */
/* SCHEMA CHECKOUT               */
/* ============================= */
const pagamentoSchema = z.object({
  pedidoId: z.string().uuid(),
});

/* ============================= */
/* SCHEMA WEBHOOK                */
/* ============================= */
const webhookSchema = z.object({
  type: z.string().optional(),
  data: z
    .object({
      id: z.string(),
    })
    .optional(),
});

/* ============================= */
/* CRIAR CHECKOUT (PREFERENCE)   */
/* ============================= */
// POST /api/pagamento/checkout
router.post("/checkout", async (req, res) => {
  try {
    const { pedidoId } = pagamentoSchema.parse(req.body);

    const pedido = await PedidoService.buscarPorIdComProdutos(pedidoId);

    if (!pedido) {
      throw new AppError("Pedido não encontrado.", 404);
    }

    if (pedido.status !== StatusPedido.RECEBIDO) {
      throw new AppError(
        "Pagamento só pode ser realizado para pedidos RECEBIDO.",
        400
      );
    }

    const checkout = await PaymentProvider.criarCheckoutPreference(pedido);

    // 🔑 Retorno consistente: sempre dentro de { success, data }
    return res.status(200).json({
      success: true,
      data: {
        init_point: checkout.init_point,
        ...checkout, // mantém outros dados que o provider retornar
      },
    });
  } catch (error: any) {
    console.error("🔥 ERRO CHECKOUT:", error);

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

    const paymentId = parsed.data.data?.id;
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

    // 🔐 PROTEÇÃO contra external_reference null
    if (!pagamento.pedidoId) {
      console.error("Pagamento sem external_reference");
      return res.sendStatus(200);
    }

    const pedido = await PedidoService.buscarPorId(pagamento.pedidoId);
    if (!pedido) {
      return res.sendStatus(200);
    }

    // 🔐 Validação de valor
    if (Number(pedido.total) !== Number(pagamento.transaction_amount)) {
      console.error("🚨 Divergência de valor detectada");
      return res.sendStatus(200);
    }

    // 🔐 Só processa se ainda RECEBIDO
    if (pedido.status !== StatusPedido.RECEBIDO) {
      return res.sendStatus(200);
    }

    const pedidoAtualizado = await PedidoService.atualizarStatus(
      pedido.id,
      StatusPedido.EM_PREPARO
    );

    // 🔌 WebSocket opcional
    try {
      getIO().emit("pedido_atualizado", {
        id: pedidoAtualizado.id,
        status: pedidoAtualizado.status,
        total: pedidoAtualizado.total,
      });
    } catch {
      console.warn("⚠️ WebSocket não inicializado.");
    }

    return res.sendStatus(200);
  } catch (error) {
    console.error("🔥 ERRO WEBHOOK:", error);
    return res.sendStatus(200);
  }
});

/* ============================= */
/* EXPORTAÇÃO DAS ROTAS          */
/* ============================= */
export default router;