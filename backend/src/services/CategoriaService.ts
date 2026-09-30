import { CategoriaModel, Categoria } from "../models/Categoria";
import { ErroHttp } from "../middlewares/errorHandler";

export const CategoriaService = {
  async listar(): Promise<Categoria[]> {
    return await CategoriaModel.listar();
  },

  async criar(nome: string): Promise<Categoria> {
    const nomeLimpo = nome?.trim();

    if (!nomeLimpo) {
      throw new ErroHttp("Nome é obrigatório.", 400);
    }

    return await CategoriaModel.criar(nomeLimpo);
  },

  async atualizar(
    id: number,
    nome: string
  ): Promise<void> {
    const nomeLimpo = nome?.trim();

    if (!nomeLimpo) {
      throw new ErroHttp("Nome é obrigatório.", 400);
    }

    await CategoriaModel.atualizar(id, nomeLimpo);
  },

  async remover(id: number): Promise<void> {
    await CategoriaModel.remover(id);
  },
};