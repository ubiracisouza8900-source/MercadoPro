import { Request, Response } from "express";
import { FornecedorService } from "../services/FornecedorService";

export const FornecedorController = {
  listar: (_req: Request, res: Response) => res.json(FornecedorService.listar()),
  criar: (req: Request, res: Response) => res.status(201).json(FornecedorService.criar(req.body)),
  atualizar(req: Request, res: Response) {
    FornecedorService.atualizar(Number(req.params.id), req.body);
    res.status(204).send();
  },
  remover(req: Request, res: Response) {
    FornecedorService.remover(Number(req.params.id));
    res.status(204).send();
  },
};
