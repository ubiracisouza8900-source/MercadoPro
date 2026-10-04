import { Response } from "express";
import path from "path";
import fs from "fs";

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

interface AtualizarCompraBody {
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

    const usuarioId =
      req.usuario.id;

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

  async atualizar(
    req: RequestAutenticado,
    res: Response
  ) {
    const compraId =
      Number(req.params.id);

    const body =
      req.body as AtualizarCompraBody;

    if (!compraId) {
      res.status(400).json({
        mensagem:
          "ID da compra inválido.",
      });

      return;
    }

    const boletoArquivo =
      req.file?.filename ?? null;

    const compra =
      await CompraService.atualizar(
        compraId,
        Number(body.fornecedorId),
        Number(body.total),
        body.dataCompra,
        body.dataVencimento,
        boletoArquivo
      );

    res.json(compra);
  },

  async remover(
    req: RequestAutenticado,
    res: Response
  ) {
    const compraId =
      Number(req.params.id);

    if (!compraId) {
      res.status(400).json({
        mensagem:
          "ID da compra inválido.",
      });

      return;
    }

    const compra =
      await CompraService.buscarPorId(
        compraId
      );

    const resultado =
      await CompraService.remover(
        compraId
      );

    if (compra.boleto_arquivo) {
      const caminhoBoleto =
        path.resolve(
          process.cwd(),
          "arquivos",
          "boletos",
          compra.boleto_arquivo
        );

      if (
        fs.existsSync(caminhoBoleto)
      ) {
        fs.unlinkSync(caminhoBoleto);
      }
    }

    res.json(resultado);
  },

  async visualizarBoleto(
    req: RequestAutenticado,
    res: Response
  ) {
    const compraId =
      Number(req.params.id);

    if (!compraId) {
      res.status(400).json({
        mensagem:
          "ID da compra inválido.",
      });

      return;
    }

    const compra =
      await CompraService.buscarPorId(
        compraId
      );

    if (!compra.boleto_arquivo) {
      res.status(404).json({
        mensagem:
          "Esta compra não possui boleto.",
      });

      return;
    }

    const caminhoBoleto =
      path.resolve(
        process.cwd(),
        "arquivos",
        "boletos",
        compra.boleto_arquivo
      );

    if (
      !fs.existsSync(caminhoBoleto)
    ) {
      res.status(404).json({
        mensagem:
          "Arquivo PDF não encontrado.",
      });

      return;
    }

    res.sendFile(caminhoBoleto);
  },
};