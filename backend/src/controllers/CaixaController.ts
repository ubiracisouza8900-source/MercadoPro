import { Response } from "express";
import { RequestAutenticado } from "../middlewares/authMiddleware";
import { CaixaService } from "../services/CaixaService";

export const CaixaController = {
  async atual(
    _req: RequestAutenticado,
    res: Response
  ) {
    const caixa = await CaixaService.atual();

    return res.json(caixa);
  },

  async abrir(
    req: RequestAutenticado,
    res: Response
  ) {
    const { saldoInicial } = req.body;

    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: "Usuário não autenticado.",
      });
    }

    const caixa = await CaixaService.abrir(
      usuarioId,
      Number(saldoInicial || 0)
    );

    return res.status(201).json(caixa);
  },

  async fechar(
    req: RequestAutenticado,
    res: Response
  ) {
    const {
      valorEsperado,
      valorInformado,
    } = req.body;

    const caixa = await CaixaService.fechar(
      Number(valorEsperado || 0),
      Number(valorInformado || 0)
    );

    return res.json(caixa);
  },
};