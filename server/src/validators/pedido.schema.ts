import { z } from 'zod'

export const criarPedidoSchema = z.object({
  telefone: z.string().min(10),
  origem: z.enum(['QR_CODE', 'APP', 'ADMIN', 'BALCAO']),

  endereco: z.string().nullable().optional(),

  itens: z.array(
    z.object({
      produtoId: z.string().uuid(),

      nome: z.string(),

      preco: z.number(),

      quantidade: z.number().min(1),

      adicionais: z
        .array(
          z.object({
            nome: z.string(),
            preco: z.number(),
          }),
        )
        .optional(),
    }),
  ),
})
