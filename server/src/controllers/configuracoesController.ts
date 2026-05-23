import { Request, Response } from 'express'
import prisma from '../lib/prisma'

export async function obterBannerAcompanhamento(
  req: Request,
  res: Response,
) {
  try {
    const configuracao = await prisma.configuracao.findUnique({
      where: {
        chave: 'banner_acompanhamento',
      },
    })

    if (!configuracao) {
      return res.json({
        titulo: '',
        itens: [],
      })
    }

    return res.json(configuracao.valor)
  } catch (err) {
    console.error(err)

    return res.status(500).json({
      erro: 'Erro ao carregar banner',
    })
  }
}

export async function atualizarBannerAcompanhamento(
  req: Request,
  res: Response,
) {
  try {
    const { titulo, itens } = req.body

    await prisma.configuracao.update({
      where: {
        chave: 'banner_acompanhamento',
      },
      data: {
        valor: {
          titulo,
          itens,
        },
      },
    })

    return res.json({
      sucesso: true,
    })
  } catch (err) {
    console.error(err)

    return res.status(500).json({
      erro: 'Erro ao atualizar banner',
    })
  }
}