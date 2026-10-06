
import { CaixaModel } from "../models/Caixa";
import { ErroHttp } from "../middlewares/errorHandler";

export const CaixaService = {
  async atual() {
    const caixa = await CaixaModel.atual();

    if (!caixa) {
      return {
        status: "fechado",
        saldoInicial: 0,
        valorEsperado: 0,
        valorInformado: 0,
        diferenca: 0,
      };
    }

    return {
      caixaId: caixa.caixa_id,
      usuarioId: caixa.usuario_id,
      status: caixa.status,
      saldoInicial: Number(caixa.saldo_inicial),
      valorEsperado: Number(caixa.valor_esperado || 0),
      valorInformado: Number(caixa.valor_informado || 0),
      diferenca: Number(caixa.diferenca || 0),
      abertoEm: caixa.aberto_em,
      fechadoEm: caixa.fechado_em,
    };
  },

  async abrir(
    usuarioId: number,
    saldoInicial: number
  ) {
    const caixaAtual =
      await CaixaModel.atual();

    if (caixaAtual?.status === "aberto") {
      throw new ErroHttp(
        "O caixa já está aberto."
      );
    }

    if (
      !Number.isFinite(saldoInicial) ||
      saldoInicial < 0
    ) {
      throw new ErroHttp(
        "O saldo inicial deve ser um valor válido e não pode ser negativo."
      );
    }

    return await CaixaModel.abrir(
      usuarioId,
      saldoInicial
    );
  },

  async fechar(
    valorEsperado: number,
    valorInformado: number
  ) {
    const caixaAtual =
      await CaixaModel.atual();

    if (
      !caixaAtual ||
      caixaAtual.status !== "aberto"
    ) {
      throw new ErroHttp(
        "Não há caixa aberto."
      );
    }

    if (
      !Number.isFinite(valorEsperado) ||
      !Number.isFinite(valorInformado)
    ) {
      throw new ErroHttp(
        "Os valores do fechamento são inválidos."
      );
    }

    if (
      valorEsperado < 0 ||
      valorInformado < 0
    ) {
      throw new ErroHttp(
        "Os valores do fechamento não podem ser negativos."
      );
    }

    const diferenca =
      valorInformado - valorEsperado;

    return await CaixaModel.fechar(
      caixaAtual.caixa_id,
      valorEsperado,
      valorInformado,
      diferenca
    );
  },
};
