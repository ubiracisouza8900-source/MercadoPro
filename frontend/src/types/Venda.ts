export interface ItemVenda {
  produtoId: number;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
}

export interface Venda {
  id: number;
  clienteId?: number;
  itens: ItemVenda[];
  total: number;
  formaPagamento: "dinheiro" | "credito" | "debito" | "pix";
  dataVenda: string;
}
