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
export async function obterPedidosOnline(
  _req: Request,
  res: Response,
) {
  try {
    const configuracao = await prisma.configuracao.findUnique({
      where: {
        chave: 'PEDIDOS_ONLINE_ATIVOS',
      },
    })

    // Se ainda não existir configuração, considera ativo.
    const ativo =
      configuracao?.valor !== undefined
        ? configuracao.valor === true
        : true

    return res.json({
      sucesso: true,
      ativo,
    })
  } catch (err) {
    console.error('Erro ao carregar status dos pedidos online:', err)

    return res.status(500).json({
      sucesso: false,
      erro: 'Erro ao carregar status dos pedidos online',
    })
  }
}

export async function atualizarPedidosOnline(
  req: Request,
  res: Response,
) {
  try {
    const { ativo } = req.body

    if (typeof ativo !== 'boolean') {
      return res.status(400).json({
        sucesso: false,
        erro: 'O campo ativo deve ser booleano',
      })
    }

    const configuracao = await prisma.configuracao.upsert({
      where: {
        chave: 'PEDIDOS_ONLINE_ATIVOS',
      },
      update: {
        valor: ativo,
      },
      create: {
        chave: 'PEDIDOS_ONLINE_ATIVOS',
        valor: ativo,
      },
    })

    return res.json({
      sucesso: true,
      ativo: configuracao.valor === true,
    })
  } catch (err) {
    console.error('Erro ao atualizar status dos pedidos online:', err)

    return res.status(500).json({
      sucesso: false,
      erro: 'Erro ao atualizar status dos pedidos online',
    })
  }
}