import { Request, Response } from "express";
import { CompraService } from "../services/CompraService";

export const CompraController = {
  listar: (_req: Request, res: Response) => res.json(CompraService.listar()),
  criar: (req: Request, res: Response) =>
    res.status(201).json(CompraService.criar(req.body.fornecedorId, req.body.total)),
};
