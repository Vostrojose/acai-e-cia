"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockProvider = void 0;
class MockProvider {
    payments = new Map();
    async criarPagamentoPix(pedidoId, total) {
        const id = `MOCK-${Date.now()}`;
        const payment = {
            id,
            pedidoId,
            status: 'pending', // 🔒 NÃO APROVA AUTOMATICAMENTE
            transaction_amount: total,
            qr_code: 'PIX-MOCK-CODE',
            qr_code_base64: '',
            createdAt: new Date(),
        };
        this.payments.set(id, payment);
        return payment;
    }
    async confirmarPagamento(paymentId) {
        const payment = this.payments.get(paymentId);
        if (!payment) {
            throw new Error('Pagamento não encontrado');
        }
        if (payment.status !== 'pending') {
            throw new Error('Pagamento já processado');
        }
        payment.status = 'approved';
        this.payments.set(paymentId, payment);
        return payment;
    }
    async buscarPagamento(paymentId) {
        return this.payments.get(paymentId) || null;
    }
}
exports.MockProvider = MockProvider;
