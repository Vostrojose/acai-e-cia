import { MercadoPagoConfig, Payment } from "mercadopago";
import prisma from "../lib/prisma";
import { StatusPedido, StatusPagamento } from "@prisma/client";
import { AppError } from "../utils/AppError";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
  options: { timeout: 5000 },
});

class PagamentoService {
  async criarPagamentoPix(pedidoId: string) {
    /* ---------- 1. Buscar pedido ---------- */

    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
    });

    if (!pedido) {
      throw new AppError("Pedido não encontrado", 404);
    }

    /* ---------- 2. Segurança ---------- */

    if (pedido.status !== StatusPedido.AGUARDANDO_PAGAMENTO) {
      throw new AppError(
        "Pedido não está aguardando pagamento",
        400
      );
    }

    if (pedido.statusPagamento === StatusPagamento.APROVADO) {
      throw new AppError("Pedido já está pago", 400);
    }

    // 🔥 evita criar múltiplos pagamentos
    if (pedido.pagamentoId) {
      throw new AppError("Pagamento já iniciado para este pedido", 400);
    }

    const payment = new Payment(client);

    try {
      /* ---------- 3. Criar pagamento ---------- */

      const response = await payment.create({
        body: {
          transaction_amount: Number(pedido.total),
          description: `Pedido #${pedido.id}`,
          payment_method_id: "pix",

          payer: {
            email: "cliente@acaiecompanhia.com", // pode melhorar depois
          },

          external_reference: pedido.id,

          // ✅ CORRETO
          notification_url: `${process.env.BASE_URL}/api/pagamento/webhook`,
        },
      });

      /* ---------- 4. Salvar ---------- */

      await prisma.pedido.update({
        where: { id: pedido.id },
        data: {
          pagamentoId: String(response.id),
          externalReference: pedido.id,
          statusPagamento: StatusPagamento.PENDENTE,
        },
      });

      /* ---------- 5. Retorno ---------- */

      return {
        pagamentoId: response.id,
        qr_code: response.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64:
          response.point_of_interaction?.transaction_data?.qr_code_base64,
      };

    } catch (error) {
      console.error("Erro Mercado Pago:", error);
      throw new AppError("Erro ao gerar pagamento PIX", 500);
    }
  }
}

export default new PagamentoService();

