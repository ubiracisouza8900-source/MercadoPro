import {
  VendaModel,
  ItemVendaInput,
} from "../models/Venda";

import { CaixaModel } from "../models/Caixa";
import { ErroHttp } from "../middlewares/errorHandler";

export const VendaService = {
  async criar(
    clienteId: number | null,
    usuarioId: number,
    formaPagamento: string,
    itens: ItemVendaInput[]
  ) {
    if (!itens || itens.length === 0) {
      throw new ErroHttp(
        "A venda precisa ter ao menos um item.",
        400
      );
    }

    const formasPagamento = [
      "dinheiro",
      "pix",
      "credito",
      "debito",
    ];

    if (!formasPagamento.includes(formaPagamento)) {
      throw new ErroHttp(
        "Forma de pagamento inválida.",
        400
      );
    }

    const caixa = await CaixaModel.atual();

    if (!caixa) {
      throw new ErroHttp(
        "Não é possível realizar a venda. O caixa está fechado.",
        400
      );
    }

    return VendaModel.criar(
      clienteId ?? null,
      usuarioId,
      caixa.caixa_id,
      formaPagamento,
      itens
    );
  },

  async listar() {
    return VendaModel.listar();
  },

  async totalGeral() {
    return VendaModel.totalGeral();
  },
};