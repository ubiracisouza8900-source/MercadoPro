import { Request, Response } from "express";
import { ContaPagarService } from "../services/ContaPagarService";

export const ContaPagarController = {
  listar: (_req: Request, res: Response) => res.json(ContaPagarService.listar()),
  criar: (req: Request, res: Response) =>
    res.status(201).json(ContaPagarService.criar(req.body.descricao, req.body.valor, req.body.vencimento)),
  pagar(req: Request, res: Response) {
    ContaPagarService.pagar(Number(req.params.id));
    res.status(204).send();
  },
};
