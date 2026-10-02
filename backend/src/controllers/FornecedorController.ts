import { Request, Response } from "express";
import { FornecedorService } from "../services/FornecedorService";

export const FornecedorController = {
  async listar(_req: Request, res: Response) {
    const fornecedores = await FornecedorService.listar();

    res.json(fornecedores);
  },

  async criar(req: Request, res: Response) {
    const fornecedor = await FornecedorService.criar(
      req.body
    );

    res.status(201).json(fornecedor);
  },

  async atualizar(req: Request, res: Response) {
    await FornecedorService.atualizar(
      Number(req.params.id),
      req.body
    );

    res.status(204).send();
  },

  async remover(req: Request, res: Response) {
    await FornecedorService.remover(
      Number(req.params.id)
    );

    res.status(204).send();
  },
};