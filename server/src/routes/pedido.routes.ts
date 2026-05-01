import { Router } from 'express'
import pedidoController from '../controllers/pedido.controller'
import prisma from '../lib/prisma'
import { asyncHandler } from '../utils/asyncHandler'
import { serializeDecimal } from '../utils/serializeDecimal'

const router = Router()

/**
 * Criar novo pedido (cliente)
 */
router.post('/', pedidoController.criar)

/**
 * Listar pedidos (cozinha)
 * 🔥 MANTIDO ORIGINAL (NÃO ALTERADO)
 */
/*router.get("/", pedidoController.listar);*/

router.get('/', async (req, res) => {
  try {
    /* ============================= */
    /* 🔥 PARÂMETROS DA REQUISIÇÃO   */
    /* ============================= */

    const horas = Number(req.query.horas) || 36 // padrão 36h
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10

    const skip = (page - 1) * limit

    /* ============================= */
    /* 🔥 FILTRO POR TEMPO           */
    /* ============================= */

    const dataLimite = new Date()
    dataLimite.setHours(dataLimite.getHours() - horas)

    /* ============================= */
    /* 🔥 CONSULTA NO BANCO          */
    /* ============================= */

    const [pedidos, total] = await Promise.all([
      prisma.pedido.findMany({
        where: {
          criadoEm: {
            gte: dataLimite,
          },
        },
        orderBy: {
          criadoEm: 'desc',
        },
        skip: skip,
        take: limit,
        include: {
          itens: true,
        },
      }),

      prisma.pedido.count({
        where: {
          criadoEm: {
            gte: dataLimite,
          },
        },
      }),
    ])

    /* ============================= */
    /* 🔥 RESPOSTA COM PAGINAÇÃO     */
    /* ============================= */

    return res.json({
      success: true,
      data: serializeDecimal(pedidos),
      pagination: {
        page: page,
        limit: limit,
        total: Number(total),
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error('Erro ao listar pedidos:', err)

    return res.status(500).json({
      message: 'Erro ao listar pedidos',
    })
  }
})

/**
 * 🔥 LISTAR FIADOS (VERSÃO PRODUÇÃO)
 */
router.get(
  '/fiados',
  asyncHandler(async (req, res) => {
    const pedidos = await prisma.pedido.findMany({
      where: {
        pago: false,
      },
      orderBy: {
        criadoEm: 'desc',
      },
      include: {
        itens: {
          include: {
            adicionais: true,
          },
        },
        cliente: true,
      },
    })

    return res.json({
      success: true,
      data: serializeDecimal(pedidos),
    })
  }),
)

/**
 * Dashboard (livre)
 * 🔥 IMPORTANTE: rota fixa vem antes da dinâmica
 */
router.get('/dashboard', pedidoController.dashboard)

/**
 * Dashboard (livre)
 * nova rota
 */

router.get(
  '/entregues/hoje/count',
  asyncHandler(async (req, res) => {
    const inicioHoje = new Date()
    inicioHoje.setHours(0, 0, 0, 0)

    const total = await prisma.pedido.count({
      where: {
        status: 'ENTREGUE',
        atualizadoEm: {
          gte: inicioHoje,
        },
      },
    })

    return res.json({
      success: true,
      total,
    })
  }),
)

/**
 * Buscar pedido por ID (livre)
 */
router.get('/:id', pedidoController.buscarPorId)

/**
 * 🔥 COZINHA ALTERA STATUS (SEM LOGIN)
 */
router.patch('/:id/status', pedidoController.atualizarStatus)

/**
 * 🔥 MARCAR COMO PAGO (FIADO)
 */
router.patch(
  '/:id/pagar',
  asyncHandler(async (req, res) => {
    const { id } = req.params

    await prisma.pedido.update({
      where: { id },
      data: { pago: true },
    })

    return res.json({ success: true })
  }),
)

export default router
