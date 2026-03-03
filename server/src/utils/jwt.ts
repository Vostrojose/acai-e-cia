import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'

export function generateToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1d',
  })
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET)
}
