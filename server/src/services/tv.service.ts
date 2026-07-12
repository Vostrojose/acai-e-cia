import prisma from '../lib/prisma'

class TVService {
  async heartbeat(codigo: string) {
    try {
      console.log('HEARTBEAT:', codigo)

      const tv = await prisma.tV.update({
        where: {
          codigo,
        },
        data: {
          ultimaSync: new Date(),
        },
      })

      console.log('TV ATUALIZADA:', tv)

      return tv
    } catch (error) {
      console.error('ERRO HEARTBEAT:', error)
      throw error
    }
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

  async registrar() {
    let codigo = ''

    let existe = true

    while (existe) {
      codigo = `TV-${Math.floor(100000 + Math.random() * 900000)}`

      const tvExistente = await prisma.tV.findUnique({
        where: {
          codigo,
        },
      })

      existe = Boolean(tvExistente)
    }

    // Procurar playlist padrão
    const playlistPadrao = await prisma.playlist.findFirst({
      where: {
        padrao: true,
        ativa: true,
      },
    })

    return prisma.tV.create({
      data: {
        nome: 'TV Não Configurada',
        codigo,
        ativa: true,
        playlistId: playlistPadrao?.id ?? null,
      },
      include: {
        playlist: true,
      },
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
      const LIMITE_ONLINE = 90 * 1000 // 90 segundos

      const online =
        tv.ultimaSync &&
        agora - new Date(tv.ultimaSync).getTime() <= LIMITE_ONLINE

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
