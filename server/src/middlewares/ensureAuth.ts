import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'

export function ensureAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ message: 'Token não enviado' })
  }

  const [, token] = authHeader.split(' ')

  try {
    const decoded = verifyToken(token)

    // 🔐 injeta usuário na requisição
    ;(req as any).user = {
      id: decoded.id,
      role: decoded.role,
    }

    return next()
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' })
  }
}