import { z } from 'zod';
/* ============================= */
/* ITEM DO PEDIDO */
/* ============================= */
const itemPedidoSchema = z.object({
    produtoId: z
        .string()
        .uuid('produtoId deve ser um UUID válido.'),
    quantidade: z
        .number()
        .int('quantidade deve ser um número inteiro.')
        .positive('quantidade deve ser maior que zero.'),
}).strict();
/* ============================= */
/* CRIAR PEDIDO */
/* ============================= */
export const criarPedidoSchema = z
    .object({
    itens: z
        .array(itemPedidoSchema)
        .min(1, 'Pedido deve conter ao menos um item.'),
    telefone: z
        .string()
        .trim()
        .min(10, 'telefone inválido.')
        .max(20, 'telefone inválido.')
        .optional(),
    origem: z
        .string()
        .trim()
        .optional(),
    endereco: z
        .string()
        .optional(),
    tipo: z.enum([
        "MESA",
        "RETIRADA",
        "ENTREGA",
        "ONLINE"
    ]).optional(),
})
    .strict();
/* ============================= */
/* ATUALIZAR STATUS */
/* ============================= */
export const atualizarStatusSchema = z
    .object({
    status: z.enum([
        'RECEBIDO',
        'EM_PREPARO',
        'PRONTO',
        'ENTREGUE',
        'CANCELADO',
    ]),
})
    .strict();
