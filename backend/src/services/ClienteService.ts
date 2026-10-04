import {
  ClienteModel,
  Cliente,
} from "../models/Cliente";

import { ErroHttp } from "../middlewares/errorHandler";

export const ClienteService = {
  async listar(): Promise<Cliente[]> {
    return await ClienteModel.listar();
  },

  async criar(
    d: Partial<Cliente>
  ): Promise<Cliente> {
    if (!d.nome?.trim()) {
      throw new ErroHttp(
        "Nome é obrigatório."
      );
    }

    return await ClienteModel.criar(d);
  },

  async atualizar(
    id: number,
    d: Partial<Cliente>
  ): Promise<void> {
    if (!d.nome?.trim()) {
      throw new ErroHttp(
        "Nome é obrigatório."
      );
    }

    await ClienteModel.atualizar(id, d);
  },

  async remover(
    id: number
  ): Promise<void> {
    await ClienteModel.remover(id);
  },
};