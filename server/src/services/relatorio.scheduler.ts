import cron from 'node-cron'
import relatorioService from './relatorio.service'

class RelatorioScheduler {
  iniciar() {
    console.log(
      '[RELATORIOS] Scheduler iniciado',
    )

    // Diário - 20:00

    cron.schedule(
      '0 20 * * *',
      async () => {
        try {
          console.log(
            '[RELATORIOS] Gerando relatório diário',
          )

          await relatorioService.gerarRelatorioDiario()
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
      '0 20 * * 6',
      async () => {
        try {
          console.log(
            '[RELATORIOS] Gerando relatório semanal',
          )

          await relatorioService.gerarRelatorioSemanal()
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
      '0 20 1 * *',
      async () => {
        try {
          console.log(
            '[RELATORIOS] Gerando relatório mensal',
          )

          await relatorioService.gerarRelatorioMensal()
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