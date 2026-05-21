import { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import authService from '../services/auth.service'
import securityLogService from '../services/securityLog.service'
import securityAlertService from '../services/securityAlert.service'

class AuthController {
  login = asyncHandler(async (request: Request, response: Response) => {
    const { email, senha, password } = request.body

    const senhaFinal = senha || password

    const result = await authService.login(email, senhaFinal)
    await securityLogService.registrar({
      tipo: 'AUTH',
      acao: 'LOGIN_ADMIN',

      usuario: email,

      detalhes: {
        ip: request.ip,
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
${request.ip}

Data:
${new Date().toLocaleString('pt-BR')}
  `,
    })

    return response.json({
      success: true,
      data: result,
    })
  })
}

export default new AuthController()
