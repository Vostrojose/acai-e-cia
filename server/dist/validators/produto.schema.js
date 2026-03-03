"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.criarProdutoSchema = void 0;
const zod_1 = require("zod");
exports.criarProdutoSchema = zod_1.z.object({
    nome: zod_1.z.string().min(1, 'Nome é obrigatório'),
    descricao: zod_1.z.string().optional(),
    preco: zod_1.z
        .number()
        .positive('Preço deve ser maior que zero'),
    ativo: zod_1.z.boolean().optional(),
});
