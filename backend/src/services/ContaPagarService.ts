import { ContaPagarModel } from "../models/ContaPagar";
import { ErroHttp } from "../middlewares/errorHandler";

export const ContaPagarService = {
  listar: () => ContaPagarModel.listar(),
  criar(descricao: string, valor: number, vencimento: string) {
    if (!descricao || !valor || !vencimento) throw new ErroHttp("Descrição, valor e vencimento são obrigatórios.");
    return { id: ContaPagarModel.criar(descricao, valor, vencimento) };
  },
  pagar: (id: number) => ContaPagarModel.pagar(id),
};
