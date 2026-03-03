import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.produto.createMany({
    data: [
      {
        nome: 'Açaí 300ml',
        descricao: 'Açaí tradicional',
        preco: 15,
      },
      {
        nome: 'Açaí 400ml',
        descricao: 'Açaí especial',
        preco: 20,
      },
      {
        nome: 'Milkshake 400ml',
        descricao: 'Milkshake cremoso',
        preco: 18,
      },
    ],
  })

  console.log('🌱 Seed executado com sucesso')
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
