import { z } from 'zod'

export const atualizarStatusSchema = z.object({
  status: z.enum([
    'RECEBIDO',
    'EM_PREPARO',
    'PRONTO',
    'ENTREGUE',
    'CANCELADO',
  ]),
})

export type AtualizarStatusDTO = z.infer<typeof atualizarStatusSchema>
