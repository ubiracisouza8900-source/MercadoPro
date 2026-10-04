import { CompraModel } from "../models/Compra";
import { ErroHttp } from "../middlewares/errorHandler";

export const CompraService = {
  async listar() {
    return await CompraModel.listar();
  },

  async buscarPorId(compraId: number) {
    const compra =
      await CompraModel.buscarPorId(compraId);

    if (!compra) {
      throw new ErroHttp(
        "Compra não encontrada.",
        404
      );
    }

    return compra;
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

  async atualizar(
    compraId: number,
    fornecedorId: number,
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

    const compra =
      await CompraModel.atualizar(
        compraId,
        fornecedorId,
        total,
        dataCompra,
        dataVencimento,
        boletoArquivo
      );

    if (!compra) {
      throw new ErroHttp(
        "Compra não encontrada.",
        404
      );
    }

    return compra;
  },

  async remover(compraId: number) {
    const removida =
      await CompraModel.remover(compraId);

    if (!removida) {
      throw new ErroHttp(
        "Compra não encontrada.",
        404
      );
    }

    return {
      mensagem: "Compra excluída com sucesso.",
    };
  },
};