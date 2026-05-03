import { z } from 'zod'

export const criarProdutoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),

  preco: z.number().positive('Preço deve ser maior que zero'),

  ativo: z.boolean().optional(),

  /* 🔥 ADICIONE ISSO */
  disponivelSeg: z.boolean().optional(),
  disponivelTer: z.boolean().optional(),
  disponivelQua: z.boolean().optional(),
  disponivelQui: z.boolean().optional(),
  disponivelSex: z.boolean().optional(),
  disponivelSab: z.boolean().optional(),
  disponivelDom: z.boolean().optional(),
})

export type CriarProdutoDTO = z.infer<typeof criarProdutoSchema>