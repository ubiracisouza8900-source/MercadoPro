import { CompraModel } from "../models/Compra";
import { ErroHttp } from "../middlewares/errorHandler";

export const CompraService = {
  async listar() {
    return await CompraModel.listar();
  },

  async criar(
    fornecedorId: number,
    usuarioId: number,
    total: number,
    dataCompra: string,
    dataVencimento: string | null,
    boletoArquivo: string | null
  ) {
    if (!fornecedorId) {
      throw new ErroHttp(
        "Fornecedor é obrigatório."
      );
    }

    if (!usuarioId) {
      throw new ErroHttp(
        "Usuário é obrigatório."
      );
    }

    if (total < 0) {
      throw new ErroHttp(
        "O valor da compra não pode ser negativo."
      );
    }

    if (!dataCompra) {
      throw new ErroHttp(
        "Data da compra é obrigatória."
      );
    }

    if (!dataVencimento) {
      throw new ErroHttp(
        "Data de vencimento é obrigatória."
      );
    }

    return await CompraModel.criar(
      fornecedorId,
      usuarioId,
      total,
      dataCompra,
      dataVencimento,
      boletoArquivo
    );
  },
};