import { z } from "zod";

export const criarPedidoSchema = z.object({
  telefone: z.string().min(10),
  origem: z.enum(["QR_CODE", "APP", "ADMIN", "BALCAO"]),
  
  // 🔥 CORREÇÃO AQUI
  endereco: z.string().nullable().optional(),

  itens: z.array(
    z.object({
      produtoId: z.string().uuid(),
      quantidade: z.number().min(1),
    })
  ),
});
