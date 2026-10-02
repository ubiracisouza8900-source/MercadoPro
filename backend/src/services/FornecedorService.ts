import {
  FornecedorModel,
  Fornecedor,
} from "../models/Fornecedor";

import { ErroHttp } from "../middlewares/errorHandler";

export const FornecedorService = {
  async listar(): Promise<Fornecedor[]> {
    return await FornecedorModel.listar();
  },

  async criar(
    d: Partial<Fornecedor>
  ): Promise<Fornecedor> {
    if (!d.nome?.trim()) {
      throw new ErroHttp("Nome é obrigatório.");
    }

    return await FornecedorModel.criar(d);
  },

  async atualizar(
    id: number,
    d: Partial<Fornecedor>
  ): Promise<void> {
    if (!d.nome?.trim()) {
      throw new ErroHttp("Nome é obrigatório.");
    }

    await FornecedorModel.atualizar(id, d);
  },

  async remover(id: number): Promise<void> {
    await FornecedorModel.remover(id);
  },
};