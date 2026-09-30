import { ProdutoModel, Produto } from "../models/Produto";
import { ErroHttp } from "../middlewares/errorHandler";

export const ProdutoService = {
  async listar(): Promise<Produto[]> {
    return await ProdutoModel.listar();
  },

  async buscarPorCodigo(codigo: string): Promise<Produto> {
    const produto = await ProdutoModel.buscarPorCodigo(codigo);

    if (!produto) {
      throw new ErroHttp("Produto não encontrado.", 404);
    }

    return produto;
  },

  async criar(d: Partial<Produto>): Promise<Produto> {
    if (!d.nome?.trim()) {
      throw new ErroHttp("Nome do produto é obrigatório.", 400);
    }

    if (
      d.precoVenda === undefined ||
      d.precoVenda === null ||
      Number(d.precoVenda) < 0
    ) {
      throw new ErroHttp("Preço de venda inválido.", 400);
    }

    const produtoId = await ProdutoModel.criar(d);

    const produto = await ProdutoModel.buscarPorId(produtoId);

    if (!produto) {
      throw new ErroHttp("Erro ao cadastrar produto.", 500);
    }

    return produto;
  },

  async atualizar(
    id: number,
    d: Partial<Produto>
  ): Promise<Produto> {
    const existente = await ProdutoModel.buscarPorId(id);

    if (!existente) {
      throw new ErroHttp("Produto não encontrado.", 404);
    }

    const dadosAtualizados: Partial<Produto> = {
      ...existente,
      ...d,
    };

    await ProdutoModel.atualizar(id, dadosAtualizados);

    const produto = await ProdutoModel.buscarPorId(id);

    if (!produto) {
      throw new ErroHttp("Erro ao atualizar produto.", 500);
    }

    return produto;
  },

  async remover(id: number): Promise<void> {
    const produto = await ProdutoModel.buscarPorId(id);

    if (!produto) {
      throw new ErroHttp("Produto não encontrado.", 404);
    }

    await ProdutoModel.remover(id);
  },
};