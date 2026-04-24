import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import prisma from "../lib/prisma";
import { AppError } from "../utils/AppError";
import { StatusPedido, StatusPagamento } from "@prisma/client";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

class PagamentoService {

  /* ========================= */
  /* PIX */
  /* ========================= */
  async criarPagamentoPix(pedidoId: string) {
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
    });

    if (!pedido) {
      throw new AppError("Pedido não encontrado", 404);
    }

    if (pedido.status !== StatusPedido.AGUARDANDO_PAGAMENTO) {
      throw new AppError("Pedido não está aguardando pagamento", 400);
    }

    if (pedido.statusPagamento === StatusPagamento.APROVADO) {
      throw new AppError("Pedido já está pago", 400);
    }

    if (pedido.pagamentoId) {
      throw new AppError("Pagamento já iniciado para este pedido", 400);
    }

    const payment = new Payment(client);

    try {
      const valor = Number(pedido.total);

      const response = await payment.create({
        body: {
          transaction_amount: valor,
          description: `Pedido #${pedido.codigo ?? pedido.id}`,
          payment_method_id: "pix",
          payer: {
            email: "josemsilva1984@gmail.com",
          },
          external_reference: pedido.id,
          notification_url: `${process.env.BASE_URL}/api/pagamento/webhook`,
        },
      });

      await prisma.pedido.update({
        where: { id: pedido.id },
        data: {
          pagamentoId: String(response.id),
          externalReference: pedido.id,
          statusPagamento: StatusPagamento.PENDENTE,
        },
      });

      return {
        pagamentoId: response.id,
        qr_code: response.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64:
          response.point_of_interaction?.transaction_data?.qr_code_base64,
      };

    } catch (error) {
      console.error("🔥 ERRO COMPLETO PIX:", error);
      throw new AppError("Erro ao gerar pagamento PIX", 500);
    }
  }

  /* ========================= */
  /* CHECKOUT (CARTÃO / BOLETO / ETC) */
  /* ========================= */
  async criarCheckout(pedidoId: string) {

    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
      },
    });

    if (!pedido) {
      throw new AppError("Pedido não encontrado", 404);
    }

    if (pedido.status !== StatusPedido.AGUARDANDO_PAGAMENTO) {
      throw new AppError("Pedido não está aguardando pagamento", 400);
    }

    const preference = new Preference(client);

    try {

      /* ========================= */
      /* 🔥 ITENS CORRETOS (COM ADICIONAIS) */
      /* ========================= */
      const itensFormatados = pedido.itens.map((item) => ({
        title: item.produto.nome,
        quantity: item.quantidade,
        unit_price: Number(item.precoUnit), // 🔥 inclui adicionais
        currency_id: "BRL",
      }));

      console.log("🧾 ITENS MP:", itensFormatados);

      const response = await preference.create({
        body: {
          items: itensFormatados as any,
          external_reference: pedido.id,
          notification_url: `${process.env.BASE_URL}/api/pagamento/webhook`,
          back_urls: {
            success: "https://pedido.acaiecompanhia.com.br/sucesso",
            failure: "https://pedido.acaiecompanhia.com.br/erro",
            pending: "https://pedido.acaiecompanhia.com.br/pendente",
          },
          payer: {
            email: "josemsilva1984@gmail.com",
          },
        },
      });

      return {
        init_point: response.init_point,
      };

    } catch (error) {
      console.error("🔥 ERRO COMPLETO CHECKOUT:", error);
      throw new AppError("Erro ao criar checkout", 500);
    }
  }
}

export default new PagamentoService();


