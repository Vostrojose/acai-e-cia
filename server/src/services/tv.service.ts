import prisma from '../lib/prisma'

class TVService {
  async registrar() {
    let codigo = ''
    let existe = true

    while (existe) {
      codigo = `TV-${Math.floor(100000 + Math.random() * 900000)}`

      const encontrada = await prisma.tV.findUnique({
        where: { codigo },
      })

      existe = !!encontrada
    }

    const playlistPadrao = await prisma.playlist.findFirst({
      where: {
        ativa: true,
        padrao: true,
      },
    })

    return prisma.tV.create({
      data: {
        nome: 'Nova TV',
        codigo,
        ativa: true,
        playlistId: playlistPadrao?.id ?? null,
      },
      include: {
        playlist: true,
      },
    })
  }

  async heartbeat(codigo: string) {
    const tv = await prisma.tV.findUnique({
      where: {
        codigo,
      },
      include: {
        playlist: true,
      },
    })

    if (!tv) {
      return null
    }

    return prisma.tV.update({
      where: {
        codigo,
      },
      data: {
        ultimaSync: new Date(),
      },
      include: {
        playlist: true,
      },
    })
  }

  async buscarPorCodigo(codigo: string) {
    return prisma.tV.findUnique({
      where: {
        codigo,
      },
      include: {
        playlist: true,
      },
    })
  }

  async listar() {
    return prisma.tV.findMany({
      include: {
        playlist: true,
      },
      orderBy: {
        criadoEm: 'asc',
      },
    })
  }

  async atualizar(
    id: string,
    dados: {
      nome: string
      codigo: string
      playlistId: string | null
    },
  ) {
    return prisma.tV.update({
      where: {
        id,
      },
      data: {
        nome: dados.nome,
        codigo: dados.codigo,
        playlistId: dados.playlistId,
      },
      include: {
        playlist: true,
      },
    })
  }

  async status() {
    const agora = Date.now()

    const tvs = await prisma.tV.findMany({
      include: {
        playlist: true,
      },
      orderBy: {
        criadoEm: 'asc',
      },
    })

    return tvs.map((tv) => ({
      id: tv.id,
      nome: tv.nome,
      codigo: tv.codigo,
      playlistId: tv.playlistId,
      playlist: tv.playlist?.nome ?? null,
      ultimaSync: tv.ultimaSync,
      online: !!tv.ultimaSync && agora - tv.ultimaSync.getTime() <= 90_000,
    }))
  }
}

export default new TVService()
