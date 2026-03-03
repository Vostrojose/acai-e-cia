export interface INotificationProvider {
  enviarMensagem(telefone: string, mensagem: string): Promise<void>
}
