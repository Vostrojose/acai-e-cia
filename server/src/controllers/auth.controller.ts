import { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import authService from '../services/auth.service'
import securityLogService from '../services/securityLog.service'
import securityAlertService from '../services/securityAlert.service'

class AuthController {
login = asyncHandler(async (request: Request, response: Response) => {
  const { email, senha, password } = request.body

  const senhaFinal = senha || password

  const result = await authService.login(
    email,
    senhaFinal,
  )

  const forwarded =
    request.headers['x-forwarded-for']

  const ip = Array.isArray(forwarded)
    ? forwarded[0]
    : forwarded?.split(',')[0]?.trim() ||
      request.socket.remoteAddress ||
      request.ip

  const ipLimpo = String(ip).replace(
    '::ffff:',
    '',
  )

  await securityLogService.registrar({
    tipo: 'AUTH',
    acao: 'LOGIN_ADMIN',

    usuario: email,

    detalhes: {
      ip: ipLimpo,
      userAgent: request.headers['user-agent'],
    },
  })

  await securityAlertService.enviarAlerta({
    assunto: 'Novo login administrativo',

    mensagem: `
Novo login administrativo detectado.

Usuário:
${email}

IP:
${ipLimpo}

Data:
${new Date().toLocaleString('pt-BR')}

Origem:
Painel Administrativo

Navegador:
${request.headers['user-agent']}
`,
  })

  return response.json({
    success: true,
    data: result,
  })
})
}

export default new AuthController()
