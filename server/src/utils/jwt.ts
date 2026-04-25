import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não configurado no ambiente')
}

// 👇 AQUI GARANTE O TIPO CORRETO
const SECRET: jwt.Secret = JWT_SECRET

type JwtPayload = {
  id: string
  role: string
}

export function generateToken(payload: JwtPayload) {
  return jwt.sign(payload, SECRET, {
    expiresIn: '8h',
    algorithm: 'HS256'
  })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET, {
    algorithms: ['HS256']
  }) as JwtPayload
}