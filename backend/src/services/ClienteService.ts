import { ClienteModel, Cliente } from "../models/Cliente";
import { ErroHttp } from "../middlewares/errorHandler";

export const ClienteService = {
  listar: () => ClienteModel.listar(),
  criar(d: Partial<Cliente>) {
    if (!d.nome) throw new ErroHttp("Nome é obrigatório.");
    return { id: ClienteModel.criar(d), ...d };
  },
  atualizar(id: number, d: Partial<Cliente>) {
    if (!d.nome) throw new ErroHttp("Nome é obrigatório.");
    ClienteModel.atualizar(id, d);
  },
  remover: (id: number) => ClienteModel.remover(id),
};
