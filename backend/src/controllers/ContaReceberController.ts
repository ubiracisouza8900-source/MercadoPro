import { Response } from "express";
import { ContaReceberService } from "../services/ContaReceberService";
import { RequestAutenticado } from "../middlewares/authMiddleware";

export const ContaReceberController = {
  async listar(
    _req: RequestAutenticado,
    res: Response
  ) {
    const contas = await ContaReceberService.listar();

    return res.json(contas);
  },

  async criar(
    req: RequestAutenticado,
    res: Response
  ) {
    const {
      clienteId,
      vendaId,
      valor,
      vencimento,
    } = req.body;

    const conta = await ContaReceberService.criar(
      Number(clienteId),
      Number(valor),
      vencimento,
      vendaId ? Number(vendaId) : undefined
    );

    return res.status(201).json(conta);
  },

  async receber(
    req: RequestAutenticado,
    res: Response
  ) {
    const id = Number(req.params.id);

    await ContaReceberService.receber(id);

    return res.status(204).send();
  },
};