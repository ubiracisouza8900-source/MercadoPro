import { Request, Response, NextFunction } from "express";

interface ErroComStatus extends Error {
  status?: number;
}

export function errorHandler(
  err: ErroComStatus,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("=================================");
  console.error("❌ ERRO NO BACKEND");
  console.error(err);
  console.error("=================================");

  const status = err.status ?? 500;

  const mensagem =
    err.message || "Erro interno do servidor.";

  if (res.headersSent) {
    return next(err);
  }

  return res.status(status).json({
    erro: mensagem,
    mensagem: mensagem,
  });
}

export class ErroHttp extends Error {
  status: number;

  constructor(
    mensagem: string,
    status = 400
  ) {
    super(mensagem);

    this.status = status;

    Object.setPrototypeOf(
      this,
      ErroHttp.prototype
    );
  }
}