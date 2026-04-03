class ManualWhatsAppProvider {
    async enviarMensagem(telefone, mensagem) {
        console.log('📲 ENVIO MANUAL NECESSÁRIO');
        console.log(`Telefone: ${telefone}`);
        console.log(`Mensagem: ${mensagem}`);
    }
}
export default new ManualWhatsAppProvider();
