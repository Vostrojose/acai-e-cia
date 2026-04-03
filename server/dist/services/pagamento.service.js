import { MercadoPagoConfig, Payment } from 'mercadopago';
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
    options: { timeout: 5000 }
});
class PagamentoService {
    async criarPagamentoPix(pedidoId, total) {
        const payment = new Payment(client);
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
export default new PagamentoService();
