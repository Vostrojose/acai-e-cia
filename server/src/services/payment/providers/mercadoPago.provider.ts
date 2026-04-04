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
    const valor = Number(pedido.total)

    console.log('🧪 [MP PIX] Criando pagamento PIX')
    console.log('Pedido:', pedido.id)
    console.log('Valor:', valor)

    try {
      const response = await this.payment.create({
        body: {
          transaction_amount: valor,
          description: `Pedido #${pedido.id}`,
          payment_method_id: 'pix',

          // ✔ manter no PIX (ok)
          payer: {
            email: process.env.MP_TEST_USER_EMAIL || 'test@test.com',
          },

          external_reference: pedido.id,
          notification_url: `${process.env.BASE_URL}/api/pagamento/webhook`,
        },
      })

      console.log('✅ [MP PIX] Criado com sucesso:')
      console.log(JSON.stringify(response, null, 2))

      return {
        pagamentoId: response.id,
        qr_code: response.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64:
          response.point_of_interaction?.transaction_data?.qr_code_base64,
      }
    } catch (error: any) {
      console.error('❌ [MP PIX] Erro ao criar pagamento:')
      console.error(error?.message)
      console.error(JSON.stringify(error, null, 2))
      throw error
    }
  }

  /* ============================= */
  /* CHECKOUT (PREFERENCE)        */
  /* ============================= */

  async criarCheckoutPreference(pedido: any) {
    console.log('🧪 [MP CHECKOUT] Criando preference')
    console.log('Pedido:', pedido.id)
    console.log('Itens:', pedido.itens)

    try {
      const response = await this.preference.create({
        body: {
          external_reference: pedido.id,
          notification_url: `${process.env.BASE_URL}/api/pagamento/webhook`,

          // 🚀 NOVO PADRÃO: SEM payer

          items: pedido.itens.map((item: any) => ({
            title: `Produto ${item.produtoId}`,
            quantity: item.quantidade,
            unit_price: Number(item.precoUnit),
            currency_id: 'BRL',
          })),
        },
      })

      console.log('✅ [MP CHECKOUT] Preference criada:')
      console.log(JSON.stringify(response, null, 2))

      return {
        id: response.id,
        init_point: response.init_point,
        sandbox_init_point: response.sandbox_init_point,
      }
    } catch (error: any) {
      console.error('❌ [MP CHECKOUT] Erro ao criar preference:')
      console.error(error?.message)
      console.error(JSON.stringify(error, null, 2))
      throw error
    }
  }

  /* ============================= */
  /* BUSCAR PAGAMENTO             */
  /* ============================= */

  async buscarPagamento(paymentId: string) {
    console.log('🧪 [MP] Buscando pagamento:', paymentId)

    try {
      const response = await this.payment.get({ id: paymentId })

      console.log('📥 [MP] Resposta pagamento:')
      console.log(JSON.stringify(response, null, 2))

      console.log('📊 Status:', response.status)
      console.log('📊 Status Detail:', (response as any).status_detail)

      return {
        id: response.id?.toString(),
        status: response.status,
        transaction_amount: response.transaction_amount,
        pedidoId: response.external_reference,
      }
    } catch (error: any) {
      console.error('❌ [MP] Erro ao buscar pagamento:')
      console.error(error?.message)
      console.error(JSON.stringify(error, null, 2))
      throw error
    }
  }
}