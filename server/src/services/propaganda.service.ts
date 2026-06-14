import prisma from '../lib/prisma'

class PropagandaService {
  async listar() {
    return prisma.propaganda.findMany({
      orderBy: {
        criadoEm: 'desc',
      },
    })
  }

  async buscarPorId(id: string) {
    return prisma.propaganda.findUnique({
      where: { id },
    })
  }

  async criar(data: {
    nome: string
    tipo: string
    arquivo: string
    duracao?: number
  }) {
    return prisma.propaganda.create({
      data,
    })
  }

  async atualizar(
    id: string,
    data: {
      nome?: string
      tipo?: string
      arquivo?: string
      duracao?: number
      ativo?: boolean
    },
  ) {
    return prisma.propaganda.update({
      where: { id },
      data,
    })
  }

  async remover(id: string) {
    const totalUso = await prisma.playlistItem.count({
      where: {
        propagandaId: id,
      },
    })

    if (totalUso > 0) {
      throw new Error(
        'Não é possível excluir esta propaganda porque ela está vinculada a uma playlist.',
      )
    }
    const propaganda = await prisma.propaganda.findUnique({
      where: { id },
    })

    if (!propaganda) {
      throw new Error('Propaganda não encontrada')
    }

    return prisma.propaganda.delete({
      where: { id },
    })
  }
}

export default new PropagandaService()
