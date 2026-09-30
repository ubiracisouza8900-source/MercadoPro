import { Request, Response, NextFunction } from "express";

import { AuthService } from "../services/AuthService";

export const AuthController = {
  async login(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({
          erro: "E-mail e senha são obrigatórios.",
          mensagem: "E-mail e senha são obrigatórios.",
        });
      }

      const resultado = await AuthService.login(
        email,
        senha
      );

      return res.json(resultado);
    } catch (erro) {
      return next(erro);
    }
  },
};