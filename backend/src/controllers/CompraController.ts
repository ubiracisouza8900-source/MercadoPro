import { Response } from "express";

import { CompraService } from "../services/CompraService";
import { RequestAutenticado } from "../middlewares/authMiddleware";

export const CompraController = {
  async listar(
    _req: RequestAutenticado,
    res: Response
  ) {
    const compras =
      await CompraService.listar();

    return res.json(compras);
  },

  async criar(
    req: RequestAutenticado,
    res: Response
  ) {
    const compra =
      await CompraService.criar(
        req.body,
        req.file
      );

    return res.status(201).json(compra);
  },

  async atualizar(
    req: RequestAutenticado,
    res: Response
  ) {
    const id =
      Number(req.params.id);

    const compra =
      await CompraService.atualizar(
        id,
        req.body,
        req.file
      );

    return res.json(compra);
  },

  async remover(
    req: RequestAutenticado,
    res: Response
  ) {
    const id =
      Number(req.params.id);

    await CompraService.remover(id);

    return res.status(204).send();
  },

  async visualizarBoleto(
    req: RequestAutenticado,
    res: Response
  ) {
    const id =
      Number(req.params.id);

    const boleto =
      await CompraService.visualizarBoleto(
        id
      );

    if (!boleto) {
      return res.status(404).json({
        erro: "Boleto não encontrado.",
      });
    }

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    return res.send(boleto);
  },
};