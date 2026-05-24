import prisma from '../lib/prisma'

export type SecurityLogData = {
  tipo: string
  acao: string

  usuario?: string

  entidade?: string
  entidadeId?: string

  detalhes?: any
}

class SecurityLogService {

  async registrar(data: SecurityLogData): Promise<void> {

    try {

      await prisma.securityLog.create({
        data: {
          tipo: data.tipo,
          acao: data.acao,

          usuario: data.usuario ?? null,

          entidade: data.entidade ?? null,
          entidadeId: data.entidadeId ?? null,

          detalhes: data.detalhes ?? null,
        },
      })

    } catch (error) {

      console.error(
        '[SECURITY_LOG_ERROR]',
        new Date().toISOString(),
        error,
      )
    }
  }

  async registrarErroCritico({
    acao,
    erro,
    entidade,
    entidadeId,
  }: {
    acao: string
    erro: any
    entidade?: string
    entidadeId?: string
  }): Promise<void> {

    try {

      await this.registrar({
        tipo: 'ERRO_CRITICO',

        acao,

        entidade,
        entidadeId,

        detalhes: {
          mensagem:
            erro instanceof Error
              ? erro.message
              : String(erro),

          stack:
            erro instanceof Error
              ? erro.stack
              : null,
        },
      })

    } catch (internalError) {

      console.error(
        '[CRITICAL_SECURITY_LOG_ERROR]',
        new Date().toISOString(),
        internalError,
      )
    }
  }
}

export default new SecurityLogService()