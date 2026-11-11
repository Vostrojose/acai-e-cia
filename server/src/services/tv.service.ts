import prisma from '../lib/prisma'

import { HeartbeatDTO } from '../dtos/HeartbeatDTO'

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

 async heartbeat(dados: HeartbeatDTO) {
  const { codigo } = dados

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
      ultimoHeartbeat: new Date(),

      tipo: dados.tipo ?? tv.tipo,
      versaoApp: dados.versaoApp ?? tv.versaoApp,
      versaoAndroid: dados.versaoAndroid ?? tv.versaoAndroid,
      fabricante: dados.fabricante ?? tv.fabricante,
      modelo: dados.modelo ?? tv.modelo,
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

    return tvs.map((tv) => {
      const ultimoContato =
        tv.ultimoHeartbeat && tv.ultimaSync
          ? tv.ultimoHeartbeat > tv.ultimaSync
            ? tv.ultimoHeartbeat
            : tv.ultimaSync
          : (tv.ultimoHeartbeat ?? tv.ultimaSync)

      return {
        id: tv.id,
        nome: tv.nome,
        codigo: tv.codigo,
        playlistId: tv.playlistId,
        playlist: tv.playlist?.nome ?? null,

        // Horários independentes para diagnóstico
        ultimoHeartbeat: tv.ultimoHeartbeat,
        ultimaSync: tv.ultimaSync,

        // Considera a TV online se houve contato nos últimos 90 segundos
        online: !!ultimoContato && agora - ultimoContato.getTime() <= 90_000,
      }
    })
  }
}

export default new TVService()
