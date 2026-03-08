import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/auth/login", (req: Request, res: Response) => {
  const { email, senha } = req.body as { email: string; senha: string };

  if (
    email !== process.env.ADMIN_EMAIL ||
    senha !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({
      message: "Credenciais inválidas",
    });
  }

  const token = jwt.sign(
    { role: "ADMIN" },
    process.env.JWT_SECRET as string,
    { expiresIn: "12h" }
  );

  return res.json({ token });
});

export default router;