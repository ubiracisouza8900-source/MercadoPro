import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * authMiddleware - exige token JWT válido no header Authorization.
 */
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const cabecalho = req.headers.authorization;

  if (!cabecalho) {
    return res
      .status(401)
      .json({ erro: "Token não informado." });
  }

  const [, token] = cabecalho.split(" ");

  try {
    const dados = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    req.usuario = dados as {
      id: number;
      perfil: string;
    };

    next();
  } catch {
    return res
      .status(401)
      .json({ erro: "Token inválido." });
  }
}