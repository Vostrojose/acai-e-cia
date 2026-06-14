import prisma from '../lib/prisma'

class TVService {
async heartbeat(codigo: string) {
  return prisma.tV.update({
    where: {
      codigo,
    },
    data: {
      ultimaSync: new Date(),
    },
  })
}
  async listar() {
    return prisma.tV.findMany({
      include: {
        playlist: true,
      },
      orderBy: {
        criadoEm: 'desc',
      },
    })
  }

  async buscarPorId(id: string) {
    return prisma.tV.findUnique({
      where: { id },
      include: {
        playlist: true,
      },
    })
  }

  async criar(nome: string, codigo: string, playlistId?: string) {
    return prisma.tV.create({
      data: {
        nome,
        codigo,
        playlistId,
      },
      include: {
        playlist: true,
      },
    })
  }

  async atualizar(
    id: string,
    nome: string,
    codigo: string,
    playlistId?: string,
  ) {
    return prisma.tV.update({
      where: { id },
      data: {
        nome,
        codigo,
        playlistId,
      },
      include: {
        playlist: true,
      },
    })
  }

  async remover(id: string) {
    return prisma.tV.delete({
      where: { id },
    })
  }
  async status() {
    const tvs = await prisma.tV.findMany({
      include: {
        playlist: true,
      },
      orderBy: {
        criadoEm: 'desc',
      },
    })

    const agora = Date.now()

    return tvs.map((tv) => {
      const online =
        tv.ultimaSync && agora - new Date(tv.ultimaSync).getTime() <= 60000

      return {
        id: tv.id,
        nome: tv.nome,
        codigo: tv.codigo,

        playlist: tv.playlist?.nome ?? null,

        ultimaSync: tv.ultimaSync,

        online: Boolean(online),
      }
    })
  }
}

export default new TVService()
