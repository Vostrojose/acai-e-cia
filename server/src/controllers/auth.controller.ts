import { Request, Response } from 'express'
import { asyncHandler } from '../utils/asyncHandler'
import authService from '../services/auth.service'

class AuthController {
  login = asyncHandler(async (request: Request, response: Response) => {
    const { email, senha, password } = request.body

    const senhaFinal = senha || password

    const result = await authService.login(email, senhaFinal)

    return response.json({
      success: true,
      data: result,
    })
  })
}

export default new AuthController()
