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
  /* CRIAR CHECKOUT (PREFERENCE)  */
  /* ============================= */

  async criarCheckoutPreference(pedido: any) {
    const response = await this.preference.create({
      body: {
        external_reference: pedido.id,
        notification_url: `${process.env.BASE_URL}/api/pagamento/webhook`,
        items: pedido.itens.map((item: any) => ({
          title: item.produto.nome,
          quantity: item.quantidade,
          unit_price: Number(item.precoUnit),
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
  /* BUSCAR PAGAMENTO (WEBHOOK)   */
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