type MockPaymentStatus = 'pending' | 'approved' | 'rejected'

interface MockPayment {
  id: string
  pedidoId: string
  status: MockPaymentStatus
  transaction_amount: number
  qr_code: string
  qr_code_base64: string
  createdAt: Date
}

export class MockProvider {
  private payments = new Map<string, MockPayment>()

  async criarPagamentoPix(pedidoId: string, total: number) {
    const id = `MOCK-${Date.now()}`

    const payment: MockPayment = {
      id,
      pedidoId,
      status: 'pending', // 🔒 NÃO APROVA AUTOMATICAMENTE
      transaction_amount: total,
      qr_code: 'PIX-MOCK-CODE',
      qr_code_base64: '',
      createdAt: new Date(),
    }

    this.payments.set(id, payment)

    return payment
  }

  async confirmarPagamento(paymentId: string) {
    const payment = this.payments.get(paymentId)

    if (!payment) {
      throw new Error('Pagamento não encontrado')
    }

    if (payment.status !== 'pending') {
      throw new Error('Pagamento já processado')
    }

    payment.status = 'approved'
    this.payments.set(paymentId, payment)

    return payment
  }

  async buscarPagamento(paymentId: string) {
    return this.payments.get(paymentId) || null
  }
}