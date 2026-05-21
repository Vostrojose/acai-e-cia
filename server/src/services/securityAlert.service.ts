import * as nodemailer from 'nodemailer'

class SecurityAlertService {

  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,

    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  async enviarAlerta({
    assunto,
    mensagem,
  }: {
    assunto: string
    mensagem: string
  }) {

    try {

      await this.transporter.sendMail({
        from: `"Açaí & Companhia" <${process.env.SMTP_USER}>`,

        to: process.env.SECURITY_ALERT_EMAIL,

        subject: assunto,

        text: mensagem,
      })

      console.log('✅ Alerta de segurança enviado')

    } catch (err) {

      console.error(
        '❌ Erro ao enviar alerta segurança:',
        err,
      )
    }
  }
}

export default new SecurityAlertService()