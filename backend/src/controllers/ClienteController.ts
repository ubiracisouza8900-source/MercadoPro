import { Request, Response } from "express";
import { ClienteService } from "../services/ClienteService";

export const ClienteController = {
  listar: (_req: Request, res: Response) => res.json(ClienteService.listar()),
  criar: (req: Request, res: Response) => res.status(201).json(ClienteService.criar(req.body)),
  atualizar(req: Request, res: Response) {
    ClienteService.atualizar(Number(req.params.id), req.body);
    res.status(204).send();
  },
  remover(req: Request, res: Response) {
    ClienteService.remover(Number(req.params.id));
    res.status(204).send();
  },
};
