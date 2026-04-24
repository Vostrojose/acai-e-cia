import { Request, Response } from 'express'
import produtoService from '../services/produto.service'
import { asyncHandler } from '../utils/asyncHandler'
import { criarProdutoSchema } from '../validators/produto.schema'
import { AppError } from '../utils/AppError'
import prisma from '../services/prisma'
import { serializeDecimal } from '../utils/serializeDecimal'

class ProdutoController {

  /* ============================= */
  /* CRIAR                         */
  /* ============================= */
  criar = asyncHandler(async (req: Request, res: Response) => {
    const data = criarProdutoSchema.parse(req.body)

    const produto = await produtoService.criarProduto(data)

    return res.status(201).json({
      success: true,
      data: serializeDecimal(produto),
    })
  })

  /* ============================= */
  /* LISTAR                        */
  /* ============================= */
  listar = asyncHandler(async (req: Request, res: Response) => {
    const produtos = await produtoService.listarProdutos()

    console.log("📦 PRODUTOS:", produtos)

    return res.json({
      success: true,
      data: produtos
    })
  })

  /* ============================= */
  /* 🔥 NOVO: BUSCAR POR ID        */
  /* ============================= */
  buscarPorId = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    const produto = await prisma.produto.findUnique({
      where: { id },
      include: {
        adicionais: true // 🔥 ESSENCIAL
      }
    })

    if (!produto) {
      throw new AppError('Produto não encontrado', 404)
    }

    return res.json({
      success: true,
      data: serializeDecimal(produto)
    })
  })

  /* ============================= */
  /* ALTERAR STATUS                */
  /* ============================= */
  alterarStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const { ativo } = req.body

    if (typeof ativo !== 'boolean') {
      throw new AppError('O campo "ativo" deve ser boolean.', 400)
    }

    const produto = await produtoService.alterarStatus(id, ativo)

    return res.json({
      success: true,
      data: serializeDecimal(produto),
    })
  })

  /* ============================= */
  /* REMOVER                       */
  /* ============================= */
  remover = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    await produtoService.removerProduto(id)

    return res.json({
      success: true,
    })
  })

  /* ============================= */
  /* ATUALIZAR                     */
  /* ============================= */
  atualizar = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    const produto = await prisma.produto.update({
      where: { id },
      data: req.body,
    })

    return res.json({
      success: true,
      data: serializeDecimal(produto),
    })
  })

  /* ============================= */
  /* DELETAR                       */
  /* ============================= */
  deletar = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params

    await prisma.produto.delete({
      where: { id },
    })

    return res.json({
      success: true,
    })
  })
}

export default new ProdutoController()
