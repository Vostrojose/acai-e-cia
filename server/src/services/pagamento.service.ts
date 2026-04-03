import { MercadoPagoConfig, Payment } from "mercadopago";
import prisma from "../lib/prisma";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
  options: { timeout: 5000 },
});

class PagamentoService {
  async criarPagamentoPix(pedidoId: string) {
    // 🔍 1. Buscar pedido no banco
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
    });

    if (!pedido) {
      throw new Error("Pedido não encontrado");
    }

    // 🚫 Segurança: não permitir pagar 2x
    if (pedido.statusPagamento === "APROVADO") {
      throw new Error("Pedido já está pago");
    }

    const payment = new Payment(client);

    try {
      // 💳 2. Criar pagamento no Mercado Pago
      const response = await payment.create({
        body: {
          transaction_amount: Number(pedido.total), // vem do banco
          description: `Pedido #${pedidoId}`,
          payment_method_id: "pix",

          payer: {
            email: "cliente@email.com", // 🔥 depois substituir por real
          },

          // 🔐 ESSENCIAL
          external_reference: pedido.id,

          notification_url: `${process.env.BASE_URL}/webhook/mercadopago`,
        },
      });

      // 💾 3. Salvar no banco
      await prisma.pedido.update({
        where: { id: pedidoId },
        data: {
          pagamentoId: String(response.id),
          externalReference: pedido.id,
          statusPagamento: "PENDENTE",
        },
      });

      // 📦 4. Retornar dados úteis pro front
      return {
        pagamentoId: response.id,
        qr_code: response.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64:
          response.point_of_interaction?.transaction_data?.qr_code_base64,
      };
    } catch (error) {
      console.error("Erro ao criar pagamento:", error);
      throw new Error("Erro ao gerar pagamento PIX");
    }
  }
}

export default new PagamentoService();

