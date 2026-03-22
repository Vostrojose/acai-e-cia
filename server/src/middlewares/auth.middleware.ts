import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  role: string;
}

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Token não informado"
    });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2) {
    return res.status(401).json({
      message: "Token mal formatado"
    });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({
      message: "Token mal formatado"
    });
  }

  try {

    jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    return next();

  } catch {

    return res.status(401).json({
      message: "Token inválido"
    });

  }

}