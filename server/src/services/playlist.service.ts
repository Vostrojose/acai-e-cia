import prisma from '../lib/prisma'

class PlaylistService {
  async listar() {
    return prisma.playlist.findMany({
      include: {
        itens: {
          include: {
            propaganda: true,
          },
          orderBy: {
            ordem: 'asc',
          },
        },
      },
      orderBy: {
        criadoEm: 'desc',
      },
    })
  }

  async buscarPorId(id: string) {
    return prisma.playlist.findUnique({
      where: { id },
      include: {
        itens: {
          include: {
            propaganda: true,
          },
          orderBy: {
            ordem: 'asc',
          },
        },
      },
    })
  }

  async criar(nome: string) {
    return prisma.playlist.create({
      data: {
        nome,
      },
    })
  }

  async atualizar(id: string, nome: string) {
    return prisma.playlist.update({
      where: { id },
      data: {
        nome,
      },
    })
  }

  async remover(id: string) {
    return prisma.playlist.delete({
      where: { id },
    })
  }
}

export default new PlaylistService()