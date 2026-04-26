import bcrypt from 'bcryptjs'
import prisma from './lib/prisma'

async function run() {
  const senha = '#Acai@95148'
  const senhaHash = await bcrypt.hash(senha, 10)

  console.log('🔐 SENHA USADA:', senha)
  console.log('🔐 HASH GERADO:', senhaHash)

  const user = await prisma.usuario.update({
    where: { email: 'josemsilva1984@gmail.com' },
    data: {
      senha: senhaHash,
      role: 'ADMIN',
    },
  })

  console.log('✅ Usuário atualizado:', user.email)

  const teste = await bcrypt.compare(senha, senhaHash)
  console.log('🧪 TESTE FINAL:', teste)
}

run()