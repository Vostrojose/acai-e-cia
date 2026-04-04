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

          payer: {
            email:
              process.env.MP_TEST_USER_EMAIL ||
              'test_user_123@mercadopago.com',
          },

          external_reference: pedido.id,
          notification_url: `${process.env.BASE_URL}/api/pagamento/webhook`,
        },
      })

      console.log('✅ [MP PIX] Criado com sucesso:')
      console.log(JSON.stringify(response, null, 2))

      return {
        pagamentoId: response.id,
        qr_code:
          response.point_of_interaction?.transaction_data?.qr_code,
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

          back_urls: {
            success: `${process.env.FRONTEND_URL}/sucesso`,
            failure: `${process.env.FRONTEND_URL}/erro`,
            pending: `${process.env.FRONTEND_URL}/pendente`,
          },

          auto_return: 'approved',

          payer: {
            email:
              process.env.MP_TEST_USER_EMAIL ||
              'test_user_123@mercadopago.com',
          },

          items: pedido.itens.map((item: any) => ({
            title: `Produto ${item.produtoId}`,
            quantity: Number(item.quantidade),
            unit_price: Number(item.precoUnit),
            currency_id: 'BRL',
          })),

          metadata: {
            pedido_id: pedido.id,
          },
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

  async buscarPagamento(paymentId: string): Promise<{
    id: string | undefined
    status: string | undefined
    transaction_amount: number | undefined
    externalReference: string | undefined
  }> {
    console.log('🧪 [MP] Buscando pagamento:', paymentId)

    try {
      const response: any = await this.payment.get({ id: paymentId })

      console.log('📥 [MP] Resposta pagamento:')
      console.log(JSON.stringify(response, null, 2))

      const externalRef =
        response.external_reference ||
        response.body?.external_reference ||
        response.metadata?.pedido_id ||
        undefined

      console.log('📊 External Reference resolvido:', externalRef)

      return {
        id: response.id?.toString(),
        status: response.status,
        transaction_amount: response.transaction_amount,
        externalReference: externalRef,
      }
    } catch (error: any) {
      console.error('❌ [MP] Erro ao buscar pagamento:')
      console.error(error?.message)
      console.error(JSON.stringify(error, null, 2))
      throw error
    }
  }
}