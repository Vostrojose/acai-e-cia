import cron from 'node-cron'
import relatorioService from './relatorio.service'

class RelatorioScheduler {
  iniciar() {
    console.log('[RELATORIOS] Scheduler iniciado')

    // Diário - 20:00

    cron.schedule(
      '0 20 * * 1-5',
      async () => {
        try {
          console.log('[RELATORIOS] Gerando relatório diário')

          await relatorioService.gerarEEnviarRelatorioDiario()
        } catch (error) {
          console.error(error)
        }
      },
      {
        timezone: 'America/Sao_Paulo',
      },
    )

    // Semanal - Sábado 20:00

    cron.schedule(
      '0 14 * * 0',
      async () => {
        try {
          console.log('[RELATORIOS] Gerando relatório semanal')

          await relatorioService.gerarEEnviarRelatorioSemanal()
        } catch (error) {
          console.error(error)
        }
      },
      {
        timezone: 'America/Sao_Paulo',
      },
    )

    // Mensal - Dia 1 às 20:00

    cron.schedule(
      '0 20 28-31 * *',
      async () => {
        try {
          const hoje = new Date()

          const amanha = new Date(hoje)

          amanha.setDate(hoje.getDate() + 1)

          if (amanha.getMonth() !== hoje.getMonth()) {
            console.log('[RELATORIOS] Gerando relatório mensal')

            await relatorioService.gerarEEnviarRelatorioMensal()
          }
        } catch (error) {
          console.error(error)
        }
      },
      {
        timezone: 'America/Sao_Paulo',
      },
    )
  }
}

export default new RelatorioScheduler()
