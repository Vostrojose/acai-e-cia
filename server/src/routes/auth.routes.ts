import { Router } from "express";
import authController from "../controllers/auth.controller";
import { ensureAuth } from "../middlewares/ensureAuth";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";

const router = Router();

// 🔐 LOGIN
router.post("/login", authController.login);

// 🔒 CHANGE PASSWORD
router.put("/change-password", ensureAuth, async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({ message: "Dados obrigatórios" });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({ message: "Nova senha muito curta" });
    }

    const userId = (req as any).user.id;

    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);

    if (!senhaValida) {
      return res.status(400).json({ message: "Senha atual incorreta" });
    }

    const novaHash = await bcrypt.hash(novaSenha, 10);

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { senha: novaHash },
    });

    return res.json({ success: true });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro interno" });
  }
});

export default router;