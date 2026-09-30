import {
  Request,
  Response,
  NextFunction,
} from "express";

import { CategoriaService } from "../services/CategoriaService";

export const CategoriaController = {
  async listar(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const categorias = await CategoriaService.listar();

      return res.json(categorias);
    } catch (erro) {
      return next(erro);
    }
  },

  async criar(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const categoria = await CategoriaService.criar(
        req.body.nome
      );

      return res.status(201).json(categoria);
    } catch (erro) {
      return next(erro);
    }
  },

  async atualizar(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      await CategoriaService.atualizar(
        Number(req.params.id),
        req.body.nome
      );

      return res.status(204).send();
    } catch (erro) {
      return next(erro);
    }
  },

  async remover(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      await CategoriaService.remover(
        Number(req.params.id)
      );

      return res.status(204).send();
    } catch (erro) {
      return next(erro);
    }
  },
};