import { Router } from "express";
import jwt from "jsonwebtoken";
const router = Router();
/**
 * Login de administrador
 * POST /api/auth/login
 */
router.post("/login", (req, res) => {
    console.log("BODY:", req.body);
    console.log("ADMIN_EMAIL:", process.env.ADMIN_EMAIL);
    console.log("ADMIN_PASSWORD:", process.env.ADMIN_PASSWORD);
    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    const email = req.body.email?.trim();
    const senha = req.body.senha?.trim();
    if (email !== process.env.ADMIN_EMAIL ||
        senha !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({
            message: "Credenciais inválidas",
            debug: {
                emailRecebido: email,
                senhaRecebida: senha,
                envEmail: process.env.ADMIN_EMAIL,
                envSenha: process.env.ADMIN_PASSWORD,
            },
        });
    }
    const token = jwt.sign({ role: "ADMIN" }, process.env.JWT_SECRET, { expiresIn: "12h" });
    return res.json({ token });
});
/**
 * Exportação das rotas
 */
export default router;
