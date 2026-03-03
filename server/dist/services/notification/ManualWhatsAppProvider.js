"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ManualWhatsAppProvider {
    async enviarMensagem(telefone, mensagem) {
        console.log('📲 ENVIO MANUAL NECESSÁRIO');
        console.log(`Telefone: ${telefone}`);
        console.log(`Mensagem: ${mensagem}`);
    }
}
exports.default = new ManualWhatsAppProvider();
