import { z } from 'zod'

export const criarProdutoSchema = z.object({
  nome: z.string(),

  descricao: z.string().optional(),

  preco: z.number(),

  ativo: z.boolean().optional(),

  disponivelDom: z.boolean().optional(),
  disponivelSeg: z.boolean().optional(),
  disponivelTer: z.boolean().optional(),
  disponivelQua: z.boolean().optional(),
  disponivelQui: z.boolean().optional(),
  disponivelSex: z.boolean().optional(),
  disponivelSab: z.boolean().optional(),
})
export type CriarProdutoDTO = z.infer<typeof criarProdutoSchema>
