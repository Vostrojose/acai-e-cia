import { Request, Response, NextFunction } from "express";

export function ensureAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({
      message: "Não autenticado"
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Acesso negado"
    });
  }

  return next();
}