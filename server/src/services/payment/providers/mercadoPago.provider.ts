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
    const valor = Number(Number(pedido.total).toFixed(2))

    if (!valor || valor <= 0 || isNaN(valor)) {
      throw new Error('Valor inválido para pagamento')
    }

    try {
      const response = await this.payment.create({
        body: {
          transaction_amount: valor,
          description: `Pedido #${pedido.id}`,
          payment_method_id: 'pix',
          payer: {
            email: pedido.email || 'pagamento@acaiecompanhia.com',
          },
          external_reference: String(pedido.id),
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
    if (!pedido) throw new Error('Pedido inválido')
    if (!pedido.itens || pedido.itens.length === 0)
      throw new Error('Pedido sem itens')

    if (!process.env.FRONT_URL) throw new Error('FRONT_URL não configurado')
    if (!process.env.BASE_URL) throw new Error('BASE_URL não configurado')

    try {
      /* ============================= */
      /* 🔥 ITENS CORRIGIDOS           */
      /* ============================= */

      const itensFormatados = pedido.itens.map((item: any) => {
        const precoProduto = Number(item.produto?.preco || item.preco || 0)

        const adicionais = item.adicionais || []

        const totalAdicionais = adicionais.reduce(
          (soma: number, add: any) => soma + Number(add.preco),
          0,
        )

        const precoFinal = Number((precoProduto + totalAdicionais).toFixed(2))
        const quantidade = Number(item.quantidade)

        if (!precoFinal || precoFinal <= 0 || isNaN(precoFinal)) {
          throw new Error(`Preço inválido no item ${item.produtoId}`)
        }

        if (!quantidade || quantidade <= 0 || isNaN(quantidade)) {
          throw new Error(`Quantidade inválida no item ${item.produtoId}`)
        }

        console.log('🔥 ITEM CORRIGIDO:', {
          produto: item.produto?.nome,
          precoProduto,
          adicionais: totalAdicionais,
          precoFinal,
        })

        return {
          title: String(
            item.produto?.nome ||
              item.nome ||
              `Produto ${item.produtoId || 'sem-id'}`,
          ),
          quantity: quantidade,
          unit_price: precoFinal,
          currency_id: 'BRL',
        }
      })

      /* ============================= */
      /* VALIDAÇÃO SEGURA              */
      /* ============================= */

      const totalCalculado = itensFormatados.reduce(
        (acc: number, item: any) =>
          acc + Number(item.unit_price) * Number(item.quantity),
        0,
      )

      const totalPedido = Number(Number(pedido.total).toFixed(2))
      const totalCalc = Number(totalCalculado.toFixed(2))

      if (totalPedido !== totalCalc) {
        console.error('🚨 Divergência de valores detectada', {
          totalPedido,
          totalCalc,
          itens: itensFormatados,
        })

        throw new Error('Divergência de valor no pedido')
      }

      /* ============================= */
      /* PAYLOAD MP                    */
      /* ============================= */

      const payload = {
        statement_descriptor: 'ACAIECIA',
        external_reference: String(pedido.id),

        notification_url: `${process.env.BASE_URL}/api/pagamento/webhook`,

        back_urls: {
          success: `${process.env.FRONT_URL}/sucesso/${pedido.id}`,
          failure: `${process.env.FRONT_URL}/`,
          pending: `${process.env.FRONT_URL}/sucesso/${pedido.id}`,
        },
        auto_return: 'approved',

        payer: {
          email: pedido.email || 'pagamento@acaiecompanhia.com',
        },

        items: itensFormatados,

        metadata: {
          pedido_id: pedido.id,
        },
      }

      console.log('📦 PAYLOAD MP:', JSON.stringify(payload, null, 2))

      const response = await this.preference.create({
        body: payload,
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

  /* ============================= */
  /* BUSCAR PAGAMENTO              */
  /* ============================= */

  async buscarPagamento(paymentId: string) {
    if (!paymentId) {
      throw new Error('paymentId não informado')
    }

    try {
      const response: any = await this.payment.get({
        id: paymentId,
      })

      console.log('📦 [MP] RESPOSTA BRUTA:', JSON.stringify(response, null, 2))

      /* ============================= */
      /* 🔥 COMPATIBILIDADE SDK        */
      /* ============================= */

      const body = response?.body || response

      const externalReference =
        body?.external_reference ||
        body?.externalReference ||
        body?.metadata?.pedido_id ||
        undefined

      const pagamento = {
        id: body?.id?.toString(),
        status: body?.status,
        transaction_amount: Number(body?.transaction_amount || 0),
        external_reference: externalReference,

        /* 🔥 RETROCOMPATIBILIDADE */
        externalReference: externalReference,
      }

      console.log('✅ [MP] PAGAMENTO NORMALIZADO:', pagamento)

      return pagamento
    } catch (error: any) {
      console.error('❌ [MP BUSCAR PAGAMENTO] ERRO COMPLETO:')
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
}
