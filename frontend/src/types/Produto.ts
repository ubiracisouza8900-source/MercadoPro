export interface Produto {
  produtoId: number;
  nome: string;
  categoriaId: number | null;
  categoriaNome: string | null;
  precoCusto: number;
  precoVenda: number;
  quantidadeEstoque: number;
  estoqueMinimo: number;
  codigoBarras: string | null;
  ativo: boolean;
}