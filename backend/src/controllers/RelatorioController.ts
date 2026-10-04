import { Response } from "express";
import { RelatorioService } from "../services/RelatorioService";
import { RequestAutenticado } from "../middlewares/authMiddleware";

export const RelatorioController = {
  async resumo(
    req: RequestAutenticado,
    res: Response
  ) {
    const dataInicio =
      typeof req.query.dataInicio === "string"
        ? req.query.dataInicio
        : undefined;

    const dataFim =
      typeof req.query.dataFim === "string"
        ? req.query.dataFim
        : undefined;

    const resumo =
      await RelatorioService.resumo(
        dataInicio,
        dataFim
      );

    return res.json(resumo);
  },

  async vendasPorPagamento(
    req: RequestAutenticado,
    res: Response
  ) {
    const dataInicio =
      typeof req.query.dataInicio === "string"
        ? req.query.dataInicio
        : undefined;

    const dataFim =
      typeof req.query.dataFim === "string"
        ? req.query.dataFim
        : undefined;

    const resultado =
      await RelatorioService.vendasPorPagamento(
        dataInicio,
        dataFim
      );

    return res.json(resultado);
  },

  async produtosMaisVendidos(
    req: RequestAutenticado,
    res: Response
  ) {
    const dataInicio =
      typeof req.query.dataInicio === "string"
        ? req.query.dataInicio
        : undefined;

    const dataFim =
      typeof req.query.dataFim === "string"
        ? req.query.dataFim
        : undefined;

    const resultado =
      await RelatorioService.produtosMaisVendidos(
        dataInicio,
        dataFim
      );

    return res.json(resultado);
  },
};