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

    const valorSaldoInicial =
      saldoInicial === undefined ||
      saldoInicial === null ||
      saldoInicial === ""
        ? 0
        : Number(saldoInicial);

    if (!Number.isFinite(valorSaldoInicial)) {
      return res.status(400).json({
        mensagem: "O saldo inicial informado é inválido.",
      });
    }

    const caixa = await CaixaService.abrir(
      usuarioId,
      valorSaldoInicial
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

    const esperado =
      valorEsperado === undefined ||
      valorEsperado === null ||
      valorEsperado === ""
        ? 0
        : Number(valorEsperado);

    const informado =
      valorInformado === undefined ||
      valorInformado === null ||
      valorInformado === ""
        ? 0
        : Number(valorInformado);

    if (
      !Number.isFinite(esperado) ||
      !Number.isFinite(informado)
    ) {
      return res.status(400).json({
        mensagem:
          "Os valores do fechamento são inválidos.",
      });
    }

    const caixa = await CaixaService.fechar(
      esperado,
      informado
    );

    return res.json(caixa);
  },
};