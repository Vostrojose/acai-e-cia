import { Request, Response } from 'express'
import prisma from '../services/prisma'

export class AdicionalController {
  async criar(req: Request, res: Response) {
    const { nome, preco, produtoId } = req.body

    if (
      !nome?.trim() ||
      preco === undefined ||
      preco === null ||
      preco < 0 ||
      !produtoId
    ) {
      return res.status(400).json({ message: 'Dados inválidos' })
    }

    const adicional = await prisma.adicional.create({
      data: {
        nome,
        preco,
        produtoId,
      },
    })

    return res.status(201).json({ data: adicional })
  }

  async remover(req: Request, res: Response) {
    const { id } = req.params

    await prisma.adicional.delete({
      where: { id },
    })

    return res.json({ success: true })
  }

  async atualizar(req: Request, res: Response) {
    const { id } = req.params
    const { preco } = req.body

    const adicional = await prisma.adicional.update({
      where: { id },
      data: { preco },
    })

    return res.json({ data: adicional })
  }

  async alterarStatus(req: Request, res: Response) {
    const { id } = req.params
    const { ativo } = req.body

    const adicional = await prisma.adicional.update({
      where: { id },
      data: { ativo },
    })

    return res.json({ data: adicional })
  }
}
