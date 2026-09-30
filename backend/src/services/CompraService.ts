import { CompraModel } from "../models/Compra";
import { ErroHttp } from "../middlewares/errorHandler";

export const CompraService = {
  listar: () => CompraModel.listar(),
  criar(fornecedorId: number, total: number) {
    if (!fornecedorId || !total) throw new ErroHttp("Fornecedor e total são obrigatórios.");
    return { id: CompraModel.criar(fornecedorId, total) };
  },
};
