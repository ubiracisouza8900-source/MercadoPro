import { Request, Response } from "express";
import { VendaService } from "../services/VendaService";

export const VendaController = {
  listar: (_req: Request, res: Response) => res.json(VendaService.listar()),
  criar(req: Request, res: Response) {
    const { clienteId, formaPagamento, itens } = req.body;
    res.status(201).json(VendaService.criar(clienteId, formaPagamento, itens));
  },
  relatorio: (_req: Request, res: Response) => res.json({ total: VendaService.totalGeral() }),
};
