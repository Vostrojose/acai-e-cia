import * as nodemailer from 'nodemailer'

class SecurityAlertService {

  private transporter

  constructor() {

    this.transporter = nodemailer.createTransport({

      host: process.env.SMTP_HOST,

      port: Number(process.env.SMTP_PORT),

      secure: false,

      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },

      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    })
  }

  async enviarAlerta({
    assunto,
    mensagem,
  }: {
    assunto: string
    mensagem: string
  }): Promise<void> {

    try {

      if (!process.env.SECURITY_ALERT_EMAIL) {

        console.warn(
          '[SECURITY_ALERT]',
          'SECURITY_ALERT_EMAIL não configurado',
        )

        return
      }

      await this.transporter.sendMail({

        from: `"Açaí & Companhia" <${process.env.SMTP_USER}>`,

        to: process.env.SECURITY_ALERT_EMAIL,

        subject: assunto,

        text: mensagem,
      })

      console.log(
        '[SECURITY_ALERT_SENT]',
        new Date().toISOString(),
        assunto,
      )

    } catch (error) {

      console.error(
        '[SECURITY_ALERT_ERROR]',
        new Date().toISOString(),
        error,
      )
    }
  }

  async enviarErroCritico({
    titulo,
    erro,
  }: {
    titulo: string
    erro: any
  }): Promise<void> {

    try {

      const mensagem = `
=================================

ERRO CRÍTICO - AÇAÍ & COMPANHIA

=================================

Título:
${titulo}

Horário:
${new Date().toLocaleString('pt-BR')}

Mensagem:
${
  erro instanceof Error
    ? erro.message
    : String(erro)
}

=================================
`

      await this.enviarAlerta({
        assunto: `🚨 ERRO CRÍTICO - ${titulo}`,
        mensagem,
      })

    } catch (internalError) {

      console.error(
        '[CRITICAL_ALERT_ERROR]',
        new Date().toISOString(),
        internalError,
      )
    }
  }
}

export default new SecurityAlertService()