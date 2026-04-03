import { MockProvider } from './MockProvider';
import { MercadoPagoProvider } from './providers/mercadoPago.provider';
const mode = process.env.PAYMENT_PROVIDER || 'mock';
let provider;
if (mode === 'mock') {
    provider = new MockProvider();
}
else if (mode === 'mercadopago') {
    provider = new MercadoPagoProvider();
}
else {
    throw new Error('Provider de pagamento inválido.');
}
export default provider;
