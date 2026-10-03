import { Response } from "express";
import {
  RequestAutenticado,
} from "../middlewares/authMiddleware";

import { CompraService } from "../services/CompraService";

interface CriarCompraBody {
  fornecedorId: number;
  total: number;
  dataCompra: string;
  dataVencimento: string;
}

export const CompraController = {
  async listar(
    _req: RequestAutenticado,
    res: Response
  ) {
    const compras =
      await CompraService.listar();

    res.json(compras);
  },

  async criar(
    req: RequestAutenticado,
    res: Response
  ) {
    const body =
      req.body as CriarCompraBody;

    if (!req.usuario) {
      res.status(401).json({
        mensagem:
          "Usuário não autenticado.",
      });

      return;
    }

    if (!req.file) {
      res.status(400).json({
        mensagem:
          "O boleto em PDF é obrigatório.",
      });

      return;
    }

 const usuarioId = (req as any).usuario.id;

    const boletoArquivo =
      req.file.filename;

    const compra =
      await CompraService.criar(
        Number(body.fornecedorId),
        usuarioId,
        Number(body.total),
        body.dataCompra,
        body.dataVencimento,
        boletoArquivo
      );

    res.status(201).json(compra);
  },
};