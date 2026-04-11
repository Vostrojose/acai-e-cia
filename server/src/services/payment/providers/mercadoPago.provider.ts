import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export class MercadoPagoProvider {
  private preference: Preference;
  private payment: Payment;

  constructor() {
    this.preference = new Preference(client);
    this.payment = new Payment(client);
  }

  /* ============================= */
  /* PIX                           */
  /* ============================= */

  async criarPagamentoPix(pedido: any) {
    const valor = Number(pedido.total);

    try {
      const response = await this.payment.create({
        body: {
          transaction_amount: valor,
          description: `Pedido #${pedido.id}`,
          payment_method_id: "pix",
          payer: {
            email: "SEU_EMAIL_REAL@gmail.com",
          },
          external_reference: pedido.id,
          notification_url: `${process.env.BASE_URL}/api/pagamento/webhook`,
        },
      });

      return {
        pagamentoId: response.id,
        qr_code:
          response.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64:
          response.point_of_interaction?.transaction_data?.qr_code_base64,
      };
    } catch (error: any) {
      console.error("❌ [MP PIX]", error);
      throw error;
    }
  }

  /* ============================= */
  /* CHECKOUT                      */
  /* ============================= */

  async criarCheckout(pedido: any) {
    if (!pedido.itens || pedido.itens.length === 0) {
      throw new Error("Pedido sem itens");
    }

    try {
      const response = await this.preference.create({
        body: {
          external_reference: pedido.id,

          notification_url: `${process.env.BASE_URL}/api/pagamento/webhook`,

          back_urls: {
            success: `${process.env.FRONT_URL}/sucesso`,
            failure: `${process.env.FRONT_URL}/erro`,
            pending: `${process.env.FRONT_URL}/pendente`,
          },

          payer: {
            email: "SEU_EMAIL_REAL@gmail.com",
          },

          items: pedido.itens.map((item: any) => ({
            title: `Produto ${item.produtoId}`,
            quantity: Number(item.quantidade),
            unit_price: Number(item.precoUnit),
            currency_id: "BRL",
          })),

          metadata: {
            pedido_id: pedido.id,
          },
        },
      });

      return {
        id: response.id,
        init_point: response.init_point,
      };
    } catch (error: any) {
      console.error("❌ [MP CHECKOUT]", error);
      throw error;
    }
  }

  /* ============================= */
  /* BUSCAR PAGAMENTO              */
  /* ============================= */

  async buscarPagamento(paymentId: string) {
    try {
      const response: any = await this.payment.get({ id: paymentId });

      const externalRef =
        response.external_reference ||
        response.body?.external_reference ||
        response.metadata?.pedido_id ||
        undefined;

      return {
        id: response.id?.toString(),
        status: response.status,
        transaction_amount: response.transaction_amount,
        external_reference: externalRef,
      };
    } catch (error: any) {
      console.error("❌ [MP BUSCAR PAGAMENTO]", error);
      throw error;
    }
  }
}