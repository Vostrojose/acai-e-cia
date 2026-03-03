import { INotificationProvider } from './NotificationProvider'

class ManualWhatsAppProvider implements INotificationProvider {
  async enviarMensagem(telefone: string, mensagem: string): Promise<void> {
    console.log('📲 ENVIO MANUAL NECESSÁRIO')
    console.log(`Telefone: ${telefone}`)
    console.log(`Mensagem: ${mensagem}`)
  }
}

export default new ManualWhatsAppProvider()
