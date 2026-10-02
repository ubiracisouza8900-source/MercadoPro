import { Request, Response } from "express";
import { ClienteService } from "../services/ClienteService";

export const ClienteController = {
  async listar(_req: Request, res: Response) {
    const clientes = await ClienteService.listar();
    res.json(clientes);
  },

  async criar(req: Request, res: Response) {
    const cliente = await ClienteService.criar(req.body);
    res.status(201).json(cliente);
  },

  async atualizar(req: Request, res: Response) {
    await ClienteService.atualizar(
      Number(req.params.id),
      req.body
    );

    res.status(204).send();
  },

  async remover(req: Request, res: Response) {
    await ClienteService.remover(
      Number(req.params.id)
    );

    res.status(204).send();
  },
};