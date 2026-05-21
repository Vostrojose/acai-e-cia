import prisma from '../lib/prisma'

type LogData = {
  tipo: string
  acao: string

  usuario?: string

  entidade?: string
  entidadeId?: string

  detalhes?: any
}

class SecurityLogService {
  async registrar(data: LogData) {
    try {
      await prisma.securityLog.create({
        data: {
          tipo: data.tipo,
          acao: data.acao,

          usuario: data.usuario,

          entidade: data.entidade,
          entidadeId: data.entidadeId,

          detalhes: data.detalhes,
        },
      })
    } catch (err) {
      console.error('Erro ao registrar security log:', err)
    }
  }
}

export default new SecurityLogService()