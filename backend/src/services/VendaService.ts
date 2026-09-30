import { VendaModel, ItemVendaInput } from "../models/Venda";
import { ErroHttp } from "../middlewares/errorHandler";

export const VendaService = {
  criar(clienteId: number | null, formaPagamento: string, itens: ItemVendaInput[]) {
    if (!itens || itens.length === 0) throw new ErroHttp("A venda precisa ter ao menos um item.");
    return VendaModel.criar(clienteId ?? null, formaPagamento || "dinheiro", itens);
  },
  listar: () => VendaModel.listar(),
  totalGeral: () => VendaModel.totalGeral(),
};
