import { Request, Response } from "express";
import prisma from "../lib/prisma";

class BalcaoController {
  async criar(req: Request, res: Response) {
    const { itens } = req.body;

    if (!itens || itens.length === 0) {
      return res.status(400).json({ message: "Itens obrigatórios" });
    }

    const total = itens.reduce(
      (acc: number, item: any) => acc + item.preco * item.quantidade,
      0
    );

    const pedido = await prisma.pedido.create({
      data: {
        origem: "BALCAO",
        status: "ENTREGUE",
        total,
        itens: {
          create: itens.map((item: any) => ({
            produtoId: item.id,
            quantidade: item.quantidade,
            preco: item.preco,
          })),
        },
      },
    });

    return res.json({
      success: true,
      data: pedido,
    });
  }
}

export default new BalcaoController();