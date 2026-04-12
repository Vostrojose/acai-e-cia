import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

/* ============================= */
/* TIPAGEM                       */
/* ============================= */

type PedidoMP = {
  id: string
  total: number | string
  itens: {
    produtoId: string
    quantidade: number
    precoUnit: number
    produto?: {
      nome?: string
    }
    nome?: string
  }[]
}

/* ============================= */
/* CLIENT                        */
/* ============================= */

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

  async criarPagamentoPix(pedido: PedidoMP) {
    const valor = Number(pedido.total)

    if (!valor || valor <= 0) {
      throw new Error('Valor inválido para pagamento')
    }

    try {
      const response = await this.payment.create({
        transaction_amount: valor,
        description: `Pedido #${pedido.id}`,
        payment_method_id: 'pix',
        payer: {
          email: 'pagamento@acaiecompanhia.com',
        },
        external_reference: pedido.id,
        notification_url: `${process.env.BASE_URL}/api/pagamento/webhook`,
      } as any) // 🔥 CORREÇÃO AQUI

      return {
        pagamentoId: response.id,
        qr_code: response.point_of_interaction?.transaction_data?.qr_code,
        qr_code_base64:
          response.point_of_interaction?.transaction_data?.qr_code_base64,
      }
    } catch (error: any) {
      console.error('❌ [MP PIX]', error)
      throw error
    }
  }

  /* ============================= */
  /* CHECKOUT                      */
  /* ============================= */

  async criarCheckout(pedido: PedidoMP) {
    if (!pedido) throw new Error('Pedido inválido')
    if (!pedido.itens?.length) throw new Error('Pedido sem itens')

    try {
      const itensFormatados = pedido.itens
        .map((item) => {
          const preco = Number(item.precoUnit)
          const quantidade = Number(item.quantidade)

          if (!preco || preco <= 0) return null
          if (!quantidade || quantidade <= 0) return null

          return {
            title:
              item.produto?.nome ||
              item.nome ||
              `Produto ${item.produtoId}`,
            quantity: quantidade,
            unit_price: preco,
            currency_id: 'BRL',
          }
        })
        .filter(Boolean)

      if (!itensFormatados.length) {
        throw new Error('Nenhum item válido')
      }

      const totalCalculado = itensFormatados.reduce(
        (acc, item: any) =>
          acc + item.unit_price * item.quantity,
        0,
      )

      if (Math.abs(Number(pedido.total) - totalCalculado) > 0.01) {
        throw new Error('Divergência de valor')
      }

      const response = await this.preference.create({
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
      } as any) // 🔥 CORREÇÃO AQUI

      return {
        id: response.id,
        init_point: response.init_point,
      }
    } catch (error: any) {
      console.error('❌ [MP CHECKOUT]', error)
      throw error
    }
  }

  /* ============================= */
  /* BUSCAR PAGAMENTO              */
  /* ============================= */

  async buscarPagamento(paymentId: string) {
    try {
      const response: any = await this.payment.get({ id: paymentId })

      return {
        id: response.id?.toString(),
        status: response.status,
        transaction_amount: response.transaction_amount,
        external_reference:
          response.external_reference ||
          response.metadata?.pedido_id,
      }
    } catch (error: any) {
      console.error('❌ [MP BUSCAR PAGAMENTO]', error)
      throw error
    }
  }
}