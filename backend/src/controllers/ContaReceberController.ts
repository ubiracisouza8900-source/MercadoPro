import { Request, Response } from "express";
import { ContaReceberService } from "../services/ContaReceberService";

export const ContaReceberController = {
  listar: (_req: Request, res: Response) => res.json(ContaReceberService.listar()),
  criar: (req: Request, res: Response) =>
    res.status(201).json(ContaReceberService.criar(req.body.clienteId, req.body.valor, req.body.vencimento)),
  receber(req: Request, res: Response) {
    ContaReceberService.receber(Number(req.params.id));
    res.status(204).send();
  },
};
