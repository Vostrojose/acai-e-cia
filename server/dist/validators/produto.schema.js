import { z } from 'zod';
export const criarProdutoSchema = z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    descricao: z.string().optional(),
    preco: z
        .number()
        .positive('Preço deve ser maior que zero'),
    ativo: z.boolean().optional(),
});
