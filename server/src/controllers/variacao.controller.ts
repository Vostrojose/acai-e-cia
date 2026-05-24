import { Request, Response } from 'express'
import prisma from '../services/prisma'

export class VariacaoController {
  async listar(req: Request, res: Response) {
    const { produtoId } = req.params

    const variacoes = await prisma.variacaoProduto.findMany({
      where: {
        produtoId,
      },
      orderBy: {
        criadoEm: 'asc',
      },
    })

    return res.json({
      success: true,
      data: variacoes,
    })
  }

  async criar(req: Request, res: Response) {
    const { nome, preco, produtoId } = req.body

    if (
      !nome?.trim() ||
      preco === undefined ||
      preco === null ||
      preco < 0 ||
      !produtoId
    ) {
      return res.status(400).json({
        message: 'Dados inválidos',
      })
    }

    const variacao = await prisma.variacaoProduto.create({
      data: {
        nome,
        preco,
        produtoId,
      },
    })

    return res.status(201).json({
      success: true,
      data: variacao,
    })
  }

  async atualizar(req: Request, res: Response) {
    const { id } = req.params
    const { nome, preco } = req.body

    const variacao = await prisma.variacaoProduto.update({
      where: { id },
      data: {
        nome,
        preco,
      },
    })

    return res.json({
      success: true,
      data: variacao,
    })
  }

  async alterarStatus(req: Request, res: Response) {
    const { id } = req.params
    const { ativo } = req.body

    const variacao = await prisma.variacaoProduto.update({
      where: { id },
      data: { ativo },
    })

    return res.json({
      success: true,
      data: variacao,
    })
  }

  async remover(req: Request, res: Response) {
    const { id } = req.params

    await prisma.variacaoProduto.delete({
      where: { id },
    })

    return res.json({
      success: true,
    })
  }
}
