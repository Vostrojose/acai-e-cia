import { Request, Response } from 'express'
import produtoService from '../services/produto.service'
import { asyncHandler } from '../utils/asyncHandler'
import { criarProdutoSchema } from '../validators/produto.schema'
import { AppError } from '../utils/AppError'


class ProdutoController {
  criar = asyncHandler(async (request: Request, response: Response) => {
    const data = criarProdutoSchema.parse(request.body)

    const produto = await produtoService.criarProduto(data)

    return response.status(201).json({
      success: true,
      data: produto,
    })
  })

  listar = asyncHandler(async (request: Request, response: Response) => {
    const produtos = await produtoService.listarProdutos()

    return response.json({
      success: true,
      data: produtos,
    })
  })
  alterarStatus = asyncHandler(async (request: Request, response: Response) => {
  const { id } = request.params
  const { ativo } = request.body

  if (typeof ativo !== 'boolean') {
    throw new AppError('O campo "ativo" deve ser boolean.', 400)
  }

  const produto = await produtoService.alterarStatus(id, ativo)

  return response.json({
    success: true,
    data: produto,
  })
})

}


export default new ProdutoController()
