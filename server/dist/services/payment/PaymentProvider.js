"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MockProvider_1 = require("./MockProvider");
// futuramente importar MercadoPagoProvider
const mode = process.env.PAYMENT_PROVIDER || 'mock';
let provider;
if (mode === 'mock') {
    provider = new MockProvider_1.MockProvider();
}
else {
    throw new Error('Provider não configurado');
}
exports.default = provider;
