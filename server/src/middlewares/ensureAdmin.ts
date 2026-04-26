import { Request, Response, NextFunction } from "express";

export function ensureAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log("🔥 USER NO ensureAdmin:", req.user);

  if (!req.user) {
    return res.status(401).json({
      message: "Não autenticado"
    });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Sem permissão"
    });
  }

  return next();
}