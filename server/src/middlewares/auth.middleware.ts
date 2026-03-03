import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import { AppError } from '../utils/AppError'

interface TokenPayload {
  id: string
  role: string
}

export function ensureAuthenticated(
  request: Request,
  _response: Response,
  next: NextFunction
) {
  const authHeader = request.headers.authorization

  if (!authHeader) {
    throw new AppError('Token não informado.', 401)
  }

  const parts = authHeader.split(' ')

  if (parts.length !== 2) {
    throw new AppError('Token mal formatado.', 401)
  }

  const [scheme, token] = parts

  if (!/^Bearer$/i.test(scheme)) {
    throw new AppError('Token mal formatado.', 401)
  }

  try {
    const decoded = verifyToken(token) as TokenPayload

    // 🔥 Garantir que request.user exista antes de atribuir
    ;(request as any).user = {
      id: decoded.id,
      role: decoded.role,
    }

    return next()
  } catch (err) {
    throw new AppError('Token inválido.', 401)
  }
}
