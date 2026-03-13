import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/login", (req, res) => {

  console.log("ADMIN_EMAIL:", process.env.ADMIN_EMAIL)
  console.log("ADMIN_PASSWORD:", process.env.ADMIN_PASSWORD)
  console.log("JWT_SECRET:", process.env.JWT_SECRET)

  const { email, senha } = req.body
  

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