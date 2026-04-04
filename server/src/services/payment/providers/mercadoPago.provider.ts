import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

export class MercadoPagoProvider {
  private preference: Preference
  private payment: Payment

  constructor() {
    this.preference = new Preference(client)
    this.payment = new Payment(client)
  }

  /* ============================= */
  /* PIX                          */
  /* ============================= */

  async criarPagamentoPix(pedido: any) {
    const valor = Number(pedido.total?.toString?.() || pedido.total)

    const response = await this.payment.create({
      body: {
        transaction_amount: valor,
        description: `Pedido #${pedido.id}`,
        payment_method_id: 'pix',
        payer: {
          email: 'cliente@acaiecompanhia.com',
        },
        external_reference: pedido.id,
        notification_url: `${process.env.BASE_URL}/api/pagamento/webhook`,
      },
    })

    return {
      pagamentoId: response.id,
      qr_code: response.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64:
        response.point_of_interaction?.transaction_data?.qr_code_base64,
    }
  }

  /* ============================= */
  /* CHECKOUT (PREFERENCE)        */
  /* ============================= */

  async criarCheckoutPreference(pedido: any) {
    const response = await this.preference.create({
      body: {
        external_reference: pedido.id,
        notification_url: `${process.env.BASE_URL}/api/pagamento/webhook`,

        items: pedido.itens.map((item: any) => ({
          title: item.produto?.nome || 'Produto',
          quantity: item.quantidade,
          unit_price: Number(item.precoUnit?.toString?.() || item.precoUnit),
          currency_id: 'BRL',
        })),
      },
    })

    return {
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
    }
  }

  /* ============================= */
  /* WEBHOOK                      */
  /* ============================= */

  async buscarPagamento(paymentId: string) {
    const response = await this.payment.get({ id: paymentId })

    return {
      id: response.id?.toString(),
      status: response.status,
      transaction_amount: response.transaction_amount,
      pedidoId: response.external_reference,
    }
  }
}