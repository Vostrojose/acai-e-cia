import { Request, Response } from 'express'
import prisma from '../lib/prisma'

class BalcaoController {
  async criar(req: Request, res: Response) {
    
    try {
      
      /*const { itens, forma, clienteNome } = req.body*/ /*se a cozinha crescer usar este para fluxo completo de pedidos*/

      const { itens, forma, clienteNome, pularPreparo, pago } = req.body

      const clienteNomeNormalizado = clienteNome
        ? clienteNome.toUpperCase().trim()
        : null

      const formaFinal = forma || 'PAGO'
      const pedidoPago =
        typeof pago === 'boolean' ? pago : formaFinal !== 'FIADO'

      if (!itens || itens.length === 0) {
        return res.status(400).json({ message: 'Itens obrigatórios' })
      }
      

      if (
        (formaFinal === 'FIADO' || formaFinal === 'CREDITO') &&
        !clienteNome
      ) {
        return res.status(400).json({
          message: 'Nome do cliente obrigatório',
        })
      }
      
      
      

      /* ============================= */
      /* 🔥 BUSCAR OU CRIAR CLIENTE    */
      /* ============================= */

      let cliente: any = null

      if (clienteNomeNormalizado) {
        cliente = await prisma.cliente.upsert({
          where: { nome: clienteNomeNormalizado },
          update: {},
          create: {
            nome: clienteNomeNormalizado,
          },
        })
      }
      

      /* ============================= */
      /* 🔥 CÁLCULO TOTAL              */
      /* ============================= */

      const total = itens.reduce((acc: number, item: any) => {
        const quantidadeItem = item.quantidade || 1

        const totalItem = item.preco * quantidadeItem

        const totalAdicionais = (item.adicionais || []).reduce(
          (aAcc: number, a: any) => {
            const qtdAdicional = a.quantidade || 1

            return aAcc + (a.preco || 0) * qtdAdicional * quantidadeItem
          },
          0,
        )

        return acc + totalItem + totalAdicionais
      }, 0)

      /* ============================= */
      /* 🔥 VALIDAÇÃO DE CRÉDITO       */
      /* ============================= */

      let creditoUsado = 0
      let valorRestante = total

      if (formaFinal === 'CREDITO') {
        if (!cliente) {
          return res.status(400).json({
            message: 'Cliente não encontrado',
          })
        }

        const saldo = Number(cliente.credito)

        if (saldo > 0) {
          creditoUsado = Math.min(saldo, total)
          valorRestante = total - creditoUsado
        }
      }

      /* ============================= */
      /* 🔥 CRIA PEDIDO                */
      /* ============================= */

      const pedido = await prisma.pedido.create({
        data: {
          origem: 'BALCAO',
          status: pularPreparo
            ? 'PRONTO'
            : 'RECEBIDO' /*  aqui tambem para cozinha grandestatus: 'RECEBIDO', */,

          clienteNome: clienteNomeNormalizado,
          clienteId: cliente?.id,

          formaPagamentoBalcao: formaFinal,
         pago: pedidoPago,

          total: total,

          itens: {
            create: itens.map((item: any) => ({
              produtoId: item.id,
              quantidade: item.quantidade || 1,
              precoUnit: item.preco,

              adicionais: {
                create: (item.adicionais || []).map((a: any) => ({
                  nome: a.nome,
                  preco: a.preco,
                  quantidade: a.quantidade || 1,
                })),
              },
            })),
          },
        },
      })

      /* ============================= */
      /* 🔥 DESCONTAR CRÉDITO          */
      /* ============================= */

      if (formaFinal === 'CREDITO' && cliente && creditoUsado > 0) {
        await prisma.cliente.update({
          where: { id: cliente.id },
          data: {
            credito: {
              decrement: creditoUsado,
            },
          },
        })
      }

      return res.json({
        success: true,
        data: pedido,
        creditoUsado,
        valorRestante,
        creditoRestante:
          formaFinal === 'CREDITO' && cliente
            ? Number(cliente.credito) - creditoUsado
            : null,
      })
    } catch (err) {
      console.error('Erro no balcão:', err)
      return res.status(500).json({
        message: 'Erro ao criar pedido',
      })
    }
  }
  async listarPendentes(req: Request, res: Response) {
    try {
      const pedidos = await prisma.pedido.findMany({
        where: {
          origem: 'BALCAO',
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
        },
      })

      return res.json({
        success: true,
        data: pedidos,
      })
    } catch (err) {
      console.error('Erro ao listar pendentes:', err)

      return res.status(500).json({
        message: 'Erro ao listar pendentes',
      })
    }
  }

  async quitar(req: Request, res: Response) {
    try {
      const { id } = req.params

      const pedido = await prisma.pedido.update({
        where: {
          id,
        },

        data: {
          pago: true,
        },
      })

      return res.json({
        success: true,
        data: pedido,
      })
    } catch (err) {
      console.error('Erro ao quitar pedido:', err)

      return res.status(500).json({
        message: 'Erro ao quitar pedido',
      })
    }
  }
}

export default new BalcaoController()
