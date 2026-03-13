"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MockProvider_1 = require("./MockProvider");
const mercadoPago_provider_1 = require("./providers/mercadoPago.provider");
const mode = process.env.PAYMENT_PROVIDER || 'mock';
let provider;
if (mode === 'mock') {
    provider = new MockProvider_1.MockProvider();
}
else if (mode === 'mercadopago') {
    provider = new mercadoPago_provider_1.MercadoPagoProvider();
}
else {
    throw new Error('Provider de pagamento inválido.');
}
exports.default = provider;
