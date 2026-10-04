import { ContaReceberModel } from "../models/ContaReceber";
import { ErroHttp } from "../middlewares/errorHandler";

export const ContaReceberService = {
  async listar() {
    return ContaReceberModel.listar();
  },

  async criar(
    clienteId: number,
    valor: number,
    vencimento: string,
    vendaId?: number
  ) {
    if (!clienteId) {
      throw new ErroHttp(
        "O cliente é obrigatório.",
        400
      );
    }

    if (!valor || valor <= 0) {
      throw new ErroHttp(
        "O valor deve ser maior que zero.",
        400
      );
    }

    if (!vencimento) {
      throw new ErroHttp(
        "A data de vencimento é obrigatória.",
        400
      );
    }

    return ContaReceberModel.criar(
      clienteId,
      valor,
      vencimento,
      vendaId
    );
  },

  async receber(id: number) {
    if (!id || id <= 0) {
      throw new ErroHttp(
        "ID da conta a receber inválido.",
        400
      );
    }

    return ContaReceberModel.receber(id);
  },
};