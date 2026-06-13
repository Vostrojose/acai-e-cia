import prisma from '../lib/prisma'

class PlayerService {
  async obterPlaylistDaTV(codigo: string) {
    const tv = await prisma.tV.findUnique({
      where: {
        codigo,
      },

      include: {
        playlist: {
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
        },
      },
    })

    if (!tv) {
      throw new Error('TV não encontrada')
    }

    if (!tv.playlist) {
      throw new Error('TV sem playlist vinculada')
    }

    await prisma.tV.update({
      where: {
        id: tv.id,
      },

      data: {
        ultimaSync: new Date(),
      },
    })

    return {
      tv: {
        id: tv.id,
        nome: tv.nome,
        codigo: tv.codigo,
      },

      playlist: {
        id: tv.playlist.id,
        nome: tv.playlist.nome,
      },

      itens: tv.playlist.itens,
    }
  }
}

export default new PlayerService()