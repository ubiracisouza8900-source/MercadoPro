import { ContaReceberModel } from "../models/ContaReceber";
import { ErroHttp } from "../middlewares/errorHandler";

export const ContaReceberService = {
  listar: () => ContaReceberModel.listar(),
  criar(clienteId: number, valor: number, vencimento: string) {
    if (!clienteId || !valor || !vencimento) throw new ErroHttp("Cliente, valor e vencimento são obrigatórios.");
    return { id: ContaReceberModel.criar(clienteId, valor, vencimento) };
  },
  receber: (id: number) => ContaReceberModel.receber(id),
};
