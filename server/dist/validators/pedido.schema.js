"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.atualizarStatusSchema = exports.criarPedidoSchema = void 0;
const zod_1 = require("zod");
/* ============================= */
/* ITEM DO PEDIDO */
/* ============================= */
const itemPedidoSchema = zod_1.z.object({
    produtoId: zod_1.z
        .string()
        .uuid('produtoId deve ser um UUID válido.'),
    quantidade: zod_1.z
        .number()
        .int('quantidade deve ser um número inteiro.')
        .positive('quantidade deve ser maior que zero.'),
}).strict();
/* ============================= */
/* CRIAR PEDIDO */
/* ============================= */
exports.criarPedidoSchema = zod_1.z
    .object({
    itens: zod_1.z
        .array(itemPedidoSchema)
        .min(1, 'Pedido deve conter ao menos um item.'),
    telefone: zod_1.z
        .string()
        .trim()
        .min(10, 'telefone inválido.')
        .max(20, 'telefone inválido.')
        .optional(),
})
    .strict();
/* ============================= */
/* ATUALIZAR STATUS */
/* ============================= */
exports.atualizarStatusSchema = zod_1.z
    .object({
    status: zod_1.z.enum([
        'RECEBIDO',
        'EM_PREPARO',
        'PRONTO',
        'ENTREGUE',
        'CANCELADO',
    ]),
})
    .strict();
