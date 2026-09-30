import { FornecedorModel, Fornecedor } from "../models/Fornecedor";
import { ErroHttp } from "../middlewares/errorHandler";

export const FornecedorService = {
  listar: () => FornecedorModel.listar(),
  criar(d: Partial<Fornecedor>) {
    if (!d.nome) throw new ErroHttp("Nome é obrigatório.");
    return { id: FornecedorModel.criar(d), ...d };
  },
  atualizar(id: number, d: Partial<Fornecedor>) {
    if (!d.nome) throw new ErroHttp("Nome é obrigatório.");
    FornecedorModel.atualizar(id, d);
  },
  remover: (id: number) => FornecedorModel.remover(id),
};
