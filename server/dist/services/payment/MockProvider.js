"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockProvider = void 0;
class MockProvider {
    async criarPagamentoPix(pedidoId, total) {
        return {
            id: `MOCK-${Date.now()}`,
            status: 'approved',
            transaction_amount: total,
            pedidoId,
            qr_code: 'PIX-MOCK-CODE',
            qr_code_base64: '',
        };
    }
}
exports.MockProvider = MockProvider;
