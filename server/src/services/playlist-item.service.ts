import prisma from '../lib/prisma'

class PlaylistItemService {
  async listar(playlistId: string) {
    return prisma.playlistItem.findMany({
      where: {
        playlistId,
      },
      include: {
        propaganda: true,
      },
      orderBy: {
        ordem: 'asc',
      },
    })
  }

  async adicionar(playlistId: string, propagandaId: string) {
    const existente = await prisma.playlistItem.findFirst({
      where: {
        playlistId,
        propagandaId,
      },
    })

    if (existente) {
      throw new Error('Esta propaganda já está na playlist.')
    }
    const ultimoItem = await prisma.playlistItem.findFirst({
      where: {
        playlistId,
      },
      orderBy: {
        ordem: 'desc',
      },
    })

    const proximaOrdem = (ultimoItem?.ordem ?? 0) + 1

    return prisma.playlistItem.create({
      data: {
        playlistId,
        propagandaId,
        ordem: proximaOrdem,
      },
      include: {
        propaganda: true,
      },
    })
  }

  async remover(id: string) {
    return prisma.playlistItem.delete({
      where: {
        id,
      },
    })
  }

  async reordenar(
    playlistId: string,
    itens: {
      id: string
      ordem: number
    }[],
  ) {
    await prisma.$transaction(
      itens.map((item) =>
        prisma.playlistItem.update({
          where: {
            id: item.id,
            playlistId,
          },
          data: {
            ordem: item.ordem,
          },
        }),
      ),
    )

    return this.listar(playlistId)
  }
}

export default new PlaylistItemService()
