import { VendaModel, ItemVendaInput } from "../models/Venda";
import { CaixaModel } from "../models/Caixa";
import { ErroHttp } from "../middlewares/errorHandler";

export const VendaService = {
  async criar(
    clienteId: number | null,
    usuarioId: number,
    formaPagamento: string,
    itens: ItemVendaInput[],
    vencimento?: string
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
      "fiado",
    ];

    if (!formasPagamento.includes(formaPagamento)) {
      throw new ErroHttp(
        "Forma de pagamento inválida.",
        400
      );
    }

    if (formaPagamento === "fiado") {
      if (!clienteId) {
        throw new ErroHttp(
          "Para vender fiado, é necessário selecionar um cliente.",
          400
        );
      }

      if (!vencimento) {
        throw new ErroHttp(
          "A data de vencimento é obrigatória para vendas fiado.",
          400
        );
      }
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
      itens,
      vencimento
    );
  },

  async listar() {
    return VendaModel.listar();
  },

  async totalGeral() {
    return VendaModel.totalGeral();
  },
};