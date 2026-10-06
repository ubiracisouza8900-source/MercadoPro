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
    const usuarioId =
      req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        erro: "Usuário não autenticado.",
      });
    }

    const {
      fornecedorId,
      total,
      dataCompra,
      dataVencimento,
      boletoArquivo,
    } = req.body;

    const compra =
      await CompraService.criar(
        Number(fornecedorId),
        Number(usuarioId),
        Number(total),
        dataCompra,
        dataVencimento ?? null,
        boletoArquivo ?? null
      );

    return res.status(201).json(compra);
  },

  async atualizar(
    req: RequestAutenticado,
    res: Response
  ) {
    const id =
      Number(req.params.id);

    const {
      fornecedorId,
      total,
      dataCompra,
      dataVencimento,
      boletoArquivo,
    } = req.body;

    const compra =
      await CompraService.atualizar(
        id,
        Number(fornecedorId),
        Number(total),
        dataCompra,
        dataVencimento ?? null,
        boletoArquivo ?? null
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
};