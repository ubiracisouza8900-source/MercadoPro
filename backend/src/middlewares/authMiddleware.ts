import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface RequestAutenticado extends Request {
  usuario?: {
    id: number;
    perfil: string;
  };
}

export function authMiddleware(
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
) {
  const cabecalho = req.headers.authorization;

  if (!cabecalho) {
    return res.status(401).json({
      erro: "Token não informado.",
    });
  }

  const [, token] = cabecalho.split(" ");

  if (!token) {
    return res.status(401).json({
      erro: "Token inválido.",
    });
  }

  try {
    const dados = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    if (
      typeof dados !== "object" ||
      dados === null ||
      !("id" in dados) ||
      !("perfil" in dados)
    ) {
      return res.status(401).json({
        erro: "Token inválido.",
      });
    }

    req.usuario = {
      id: Number(dados.id),
      perfil: String(dados.perfil),
    };

    next();
  } catch {
    return res.status(401).json({
      erro: "Token inválido.",
    });
  }
}