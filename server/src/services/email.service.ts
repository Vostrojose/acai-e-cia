import nodemailer from 'nodemailer'

class EmailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,

    port: Number(process.env.SMTP_PORT),

    secure: false,

    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
 async enviarRelatorio(
  assunto: string,
  arquivoPdf: string,
) {
  const destinatarios = [
    process.env.RELATORIO_EMAIL_PRINCIPAL,
  ]

  if (process.env.RELATORIO_EMAIL_COPIA) {
    destinatarios.push(
      process.env.RELATORIO_EMAIL_COPIA,
    )
  }

  if (process.env.RELATORIO_EMAIL_COPIA2) {
    destinatarios.push(
      process.env.RELATORIO_EMAIL_COPIA2,
    )
  }

  await this.transporter.sendMail({
    from: process.env.SMTP_USER,

    to: process.env.RELATORIO_EMAIL_PRINCIPAL,

    cc: destinatarios
      .slice(1)
      .join(','),

    subject: assunto,

    html: `
      <h2>Açaí & Companhia</h2>

      <p>Segue relatório em anexo.</p>
    `,

    attachments: [
      {
        filename: 'relatorio.pdf',
        path: arquivoPdf,
      },
    ],
  })
}
}

export default new EmailService()