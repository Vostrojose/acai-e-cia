import { Router } from 'express'
import relatorioService from '../services/relatorio.service'
import pdfService from '../services/pdf.service'
import prisma from '../lib/prisma'




const router = Router()


/* =========================
   LISTAR RELATÓRIOS
========================= */

router.get('/', async (_req, res) => {
  try {
    const relatorios = await relatorioService.listarRelatorios()

    return res.json({
      success: true,
      data: relatorios,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      message: 'Erro ao listar relatórios',
    })
  }
})
/* =========================
   GERAR RELATÓRIO DIÁRIO
========================= */

router.get('/diario', async (_req, res) => {
  try {
    const relatorio = await relatorioService.gerarRelatorioDiario()

    return res.json({
      success: true,
      data: relatorio,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório diário',
    })
  }
})
/* =========================
   GERAR RELATÓRIO SEMANAL
========================= */

router.get('/semanal', async (_req, res) => {
  try {
    const relatorio = await relatorioService.gerarRelatorioSemanal()

    return res.json({
      success: true,
      data: relatorio,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório semanal',
    })
  }
})
/* =========================
   GERAR RELATÓRIO MENSAL
========================= */

router.get('/mensal', async (_req, res) => {
  try {
    const relatorio = await relatorioService.gerarRelatorioMensal()

    return res.json({
      success: true,
      data: relatorio,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório mensal',
    })
  }
})
/* =========================
   DOWNLOAD PDF
========================= */

router.get('/download/:id', async (req, res) => {
  try {
    const relatorio = await relatorioService.buscarRelatorioPorId(req.params.id)

    if (!relatorio) {
      return res.status(404).json({
        success: false,
        message: 'Relatório não encontrado',
      })
    }

    if (!relatorio.arquivoPdf) {
      return res.status(404).json({
        success: false,
        message: 'PDF não encontrado',
      })
    }

    const existe = await pdfService.existeArquivo(relatorio.arquivoPdf)

    if (!existe) {
      return res.status(404).json({
        success: false,
        message: 'Arquivo não existe',
      })
    }

    return res.download(relatorio.arquivoPdf)
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      message: 'Erro ao baixar PDF',
    })
  }
})
/* =========================
   LISTAR EXECUÇÕES
========================= */

router.get('/execucoes', async (_req, res) => {
  try {
    const execucoes = await prisma.execucaoRelatorio.findMany({
      orderBy: {
        executadoEm: 'desc',
      },

      select: {
        tipo: true,
        referencia: true,
        status: true,
        observacao: true,
        executadoEm: true,
      },
    })
    const resumo = {
      total: execucoes.length,

      diarios: execucoes.filter((e) => e.tipo === 'DIARIO').length,

      semanais: execucoes.filter((e) => e.tipo === 'SEMANAL').length,

      mensais: execucoes.filter((e) => e.tipo === 'MENSAL').length,
    }
    return res.json({
      success: true,

      resumo,

      data: execucoes,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      message: 'Erro ao listar execuções',
    })
  }
})
/* =========================
   DASHBOARD RELATÓRIOS
========================= */

router.get('/dashboard', async (_req, res) => {
  try {
    const relatorios = await prisma.relatorio.findMany({
      orderBy: {
        criadoEm: 'desc',
      },

      select: {
        id: true,

        tipo: true,

        referencia: true,

        arquivoPdf: true,

        enviadoEmail: true,

        criadoEm: true,
      },
    })

    return res.json({
      success: true,
      total: relatorios.length,
      data: relatorios,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      message: 'Erro ao carregar dashboard',
    })
  }
})
/* =========================
   RESUMO RELATÓRIOS
========================= */

router.get('/resumo', async (_req, res) => {
  try {
    const diario = await prisma.relatorio.findFirst({
      where: {
        tipo: 'DIARIO',
      },
      orderBy: {
        criadoEm: 'desc',
      },
    })

    const semanal = await prisma.relatorio.findFirst({
      where: {
        tipo: 'SEMANAL',
      },
      orderBy: {
        criadoEm: 'desc',
      },
    })

    const mensal = await prisma.relatorio.findFirst({
      where: {
        tipo: 'MENSAL',
      },
      orderBy: {
        criadoEm: 'desc',
      },
    })

    const totalExecucoes = await prisma.execucaoRelatorio.count()

    return res.json({
      success: true,

      data: {
        diario,
        semanal,
        mensal,
        totalExecucoes,
      },
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      message: 'Erro ao carregar resumo',
    })
  }
})

router.post('/:id/enviar-email', async (req, res) => {
  try {
    await relatorioService.enviarRelatorioPorEmail(
      req.params.id,
    )

    return res.json({
      success: true,
      message: 'Relatório enviado',
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      message: error instanceof Error
        ? error.message
        : 'Erro ao enviar email',
    })
  }
})


/* =========================
   BUSCAR RELATÓRIO POR ID
========================= */

router.get('/:id', async (req, res) => {
  try {
    const relatorio = await relatorioService.buscarRelatorioPorId(req.params.id)

    if (!relatorio) {
      return res.status(404).json({
        success: false,
        message: 'Relatório não encontrado',
      })
    }

    return res.json({
      success: true,
      data: relatorio,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar relatório',
    })
  }
})


export default router
