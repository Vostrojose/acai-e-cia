import prisma from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function createAdmin() {
  const email = 'admin@acai.com'
  const senha = '123456'

  const senhaHash = await bcrypt.hash(senha, 10)

  const usuarioExistente = await prisma.usuario.findUnique({
    where: { email },
  })

  if (usuarioExistente) {
    console.log('Usuário já existe.')
    process.exit(0)
  }

  const usuario = await prisma.usuario.create({
    data: {
      nome: 'Administrador',
      email,
      senha: senhaHash,
      role: 'ADMIN',
    },
  })

  console.log('Admin criado com sucesso:')
  console.log(usuario)

  process.exit(0)
}

createAdmin()
