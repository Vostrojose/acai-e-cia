import prisma from '../lib/prisma'
import r2Service from './r2.service'

class PropagandaService {
  async listar() {
    const propagandas = await prisma.propaganda.findMany({
      orderBy: {
        criadoEm: 'desc',
      },
    })

    return propagandas.map((propaganda) => ({
      ...propaganda,
      url: r2Service.url(propaganda.arquivo),
    }))
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
    console.log('==========================')
    console.log('CRIANDO PROPAGANDA')
    console.log(data)
    console.log('==========================')

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
    await r2Service.remover(propaganda.arquivo)

    return prisma.propaganda.delete({
      where: { id },
    })
  }
}

export default new PropagandaService()
