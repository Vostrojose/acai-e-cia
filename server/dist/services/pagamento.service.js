"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mercadopago_1 = require("mercadopago");
const client = new mercadopago_1.MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
    options: { timeout: 5000 }
});
class PagamentoService {
    async criarPagamentoPix(pedidoId, total) {
        const payment = new mercadopago_1.Payment(client);
        const response = await payment.create({
            body: {
                transaction_amount: Number(total),
                description: `Pedido #${pedidoId}`,
                payment_method_id: 'pix',
                payer: {
                    email: 'test_user@test.com',
                },
            },
        });
        return response;
    }
}
exports.default = new PagamentoService();
