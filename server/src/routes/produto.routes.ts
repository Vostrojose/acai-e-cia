import { Router } from 'express'
import produtoController from '../controllers/produto.controller'
import { ensureAuthenticated } from '../middlewares/auth.middleware'
import { ensureAdmin } from '../middlewares/ensureAdmin'
import prisma from '../lib/prisma'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()

/*
=================================
ROTAS PÚBLICAS (CLIENTES)
=================================
*/
router.get(
  '/:id/adicionais',
  asyncHandler(async (req, res) => {
    const { id } = req.params

    const adicionais = await prisma.adicional.findMany({
      where: {
        produtoId: id,
      },
    })

    return res.json({
      success: true,
      data: adicionais,
    })
  })
)

// Listar produtos
router.get('/', produtoController.listar)

// Buscar produto por ID
router.get('/:id', produtoController.buscarPorId)

/*
=================================
ROTAS PROTEGIDAS (ADMIN)
=================================
*/

router.post(
  '/:id/adicionais',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const { nome, preco } = req.body

    const adicional = await prisma.adicional.create({
      data: {
        nome,
        preco: Number(preco),
        produtoId: id,
      },
    })

    return res.json({
      success: true,
      data: adicional,
    })
  }),
)

// Criar produto
router.post('/', ensureAuthenticated, ensureAdmin, produtoController.criar)

// Atualizar produto
router.put(
  '/:id',
  ensureAuthenticated,
  ensureAdmin,
  produtoController.atualizar,
)

// Alterar status
router.patch(
  '/:id/status',
  ensureAuthenticated,
  ensureAdmin,
  produtoController.alterarStatus,
)

// Deletar produto
router.delete(
  '/:id',
  ensureAuthenticated,
  ensureAdmin,
  produtoController.deletar,
)

export default router
