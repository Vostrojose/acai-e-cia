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
  /* PIX                           */
  /* ============================= */

  async criarPagamentoPix(pedido: any) {
    const valor = Number(pedido.total)

    if (!valor || valor <= 0) {
      throw new Error('Valor inválido para pagamento')
    }

    try {
      const response = await this.payment.create({
        body: {
          transaction_amount: valor,
          description: `Pedido #${pedido.id}`,
          payment_method_id: 'pix',
          payer: {
            email: 'pagamento@acaiecompanhia.com',
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
    } catch (error: any) {
      console.error('❌ [MP PIX] ERRO COMPLETO:')
      console.error(error)

      if (error?.response?.data) {
        console.error(
          'MP RESPONSE:',
          JSON.stringify(error.response.data, null, 2),
        )
      }

      throw error
    }
  }

  /* ============================= */
  /* CHECKOUT                      */
  /* ============================= */

  async criarCheckout(pedido: any) {
    if (!pedido) {
      throw new Error('Pedido inválido')
    }

    if (!pedido.itens || pedido.itens.length === 0) {
      throw new Error('Pedido sem itens')
    }

    if (!process.env.FRONT_URL) {
      throw new Error('FRONT_URL não configurado')
    }

    if (!process.env.BASE_URL) {
      throw new Error('BASE_URL não configurado')
    }

    try {
      /* ============================= */
      /* FORMATAR ITENS                */
      /* ============================= */

      const itensFormatados = pedido.itens.map((item: any) => {
        const preco = Number(item.precoUnit)
        const quantidade = Number(item.quantidade)

        if (!preco || preco <= 0) {
          throw new Error(`Preço inválido no item ${item.produtoId}`)
        }

        if (!quantidade || quantidade <= 0) {
          throw new Error(`Quantidade inválida no item ${item.produtoId}`)
        }

        return {
          title: item.produto?.nome || item.nome || `Produto ${item.produtoId}`,
          quantity: quantidade,
          unit_price: preco,
          currency_id: 'BRL',
        }
      })

      /* ============================= */
      /* 🔥 VALIDAÇÃO ANTIFRAUDE       */
      /* ============================= */

      const totalCalculado = itensFormatados.reduce(
        (acc: number, item: any) =>
          acc + Number(item.unit_price) * Number(item.quantity),
        0,
      )

      if (Number(pedido.total) !== totalCalculado) {
        console.error('🚨 Divergência de valores detectada', {
          totalPedido: pedido.total,
          totalCalculado,
          itens: itensFormatados,
        })

        throw new Error('Divergência de valor no pedido')
      }

      /* ============================= */
      /* CRIAR PREFERENCE              */
      /* ============================= */

      const response = await this.preference.create({
        body: {
          external_reference: pedido.id,

          notification_url: `${process.env.BASE_URL}/api/pagamento/webhook`,

          back_urls: {
            success: `${process.env.FRONT_URL}/acompanhamento/${pedido.id}`,
            failure: `${process.env.FRONT_URL}/carrinho`,
            pending: `${process.env.FRONT_URL}/acompanhamento/${pedido.id}`,
          },

          auto_return: 'approved',

          payer: {
            email: 'pagamento@acaiecompanhia.com',
          },

          items: itensFormatados,

          metadata: {
            pedido_id: pedido.id,
          },
        },
      })

      if (!response.init_point) {
        throw new Error('Mercado Pago não retornou init_point')
      }

      return {
        id: response.id,
        init_point: response.init_point,
      }
    } catch (error: any) {
      console.error('❌ [MP CHECKOUT] ERRO COMPLETO:')
      console.error(error)

      if (error?.cause) {
        console.error('CAUSE:', error.cause)
      }

      if (error?.response?.data) {
        console.error(
          'MP RESPONSE:',
          JSON.stringify(error.response.data, null, 2),
        )
      }

      throw error
    }
  }

  /* ============================= */
  /* BUSCAR PAGAMENTO              */
  /* ============================= */

  async buscarPagamento(paymentId: string) {
    if (!paymentId) {
      throw new Error('paymentId não informado')
    }

    try {
      const response: any = await this.payment.get({ id: paymentId })

      const externalRef =
        response.external_reference ||
        response.body?.external_reference ||
        response.metadata?.pedido_id ||
        undefined

      return {
        id: response.id?.toString(),
        status: response.status,
        transaction_amount: response.transaction_amount,
        external_reference: externalRef,
      }
    } catch (error: any) {
      console.error('❌ [MP BUSCAR PAGAMENTO] ERRO COMPLETO:')
      console.error(error)

      throw error
    }
  }
}
