// src/tests/mp.test.ts
import { MercadoPagoProvider } from '../services/payment/providers/mercadoPago.provider'

async function testarPix() {
  const mpProvider = new MercadoPagoProvider()

  // Pedido fictício
  const pedidoFake = { id: '123', total: 100 }

  try {
    // Criar pagamento PIX
    const resultado = await mpProvider.criarPagamentoPix(pedidoFake)

    console.log('Resultado do pagamento PIX simulado:')
    console.log(resultado)
  } catch (err: any) {
    console.error('Erro ao testar pagamento PIX:', err.message)
  }
}

testarPix()
