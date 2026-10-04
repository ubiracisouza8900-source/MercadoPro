import {
  RelatorioModel,
  ResumoRelatorio,
  VendaPorPagamento,
  ProdutoMaisVendido,
} from "../models/Relatorio";

export const RelatorioService = {
  async resumo(
    dataInicio?: string,
    dataFim?: string
  ): Promise<ResumoRelatorio> {
    return RelatorioModel.resumo(
      dataInicio,
      dataFim
    );
  },

  async vendasPorPagamento(
    dataInicio?: string,
    dataFim?: string
  ): Promise<VendaPorPagamento[]> {
    return RelatorioModel.vendasPorPagamento(
      dataInicio,
      dataFim
    );
  },

  async produtosMaisVendidos(
    dataInicio?: string,
    dataFim?: string
  ): Promise<ProdutoMaisVendido[]> {
    return RelatorioModel.produtosMaisVendidos(
      dataInicio,
      dataFim
    );
  },
};