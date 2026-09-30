import { CaixaModel } from "../models/Caixa";
import { ErroHttp } from "../middlewares/errorHandler";

export const CaixaService = {
  atual() {
    const caixa = CaixaModel.atual();
    if (!caixa) return { status: "fechado", saldoInicial: 0, totalVendas: 0 };
    return {
      status: caixa.status,
      saldoInicial: caixa.saldo_inicial,
      totalVendas: CaixaModel.totalVendasDesde(caixa.aberto_em),
    };
  },
  abrir(saldoInicial: number) {
    if (CaixaModel.atual()?.status === "aberto") throw new ErroHttp("O caixa já está aberto.");
    CaixaModel.abrir(saldoInicial || 0);
  },
  fechar() {
    const caixa = CaixaModel.atual();
    if (!caixa || caixa.status !== "aberto") throw new ErroHttp("Não há caixa aberto.");
    CaixaModel.fechar(caixa.id);
  },
};
