import { Request, Response } from "express";
import { CaixaService } from "../services/CaixaService";

export const CaixaController = {
  atual: (_req: Request, res: Response) => res.json(CaixaService.atual()),
  abrir(req: Request, res: Response) {
    CaixaService.abrir(Number(req.body.saldoInicial));
    res.status(201).json(CaixaService.atual());
  },
  fechar(_req: Request, res: Response) {
    CaixaService.fechar();
    res.json(CaixaService.atual());
  },
};
