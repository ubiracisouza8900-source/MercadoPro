export interface ContaPagar {
  conta_pagar_id: number;
  fornecedor_id?: number | null;
  descricao: string;
  valor: number;
  vencimento: string;
  data_emissao?: string;
  status: "aberta" | "vencida" | "parcial" | "paga" | "cancelada";
  criado_em?: string;
  atualizado_em?: string;
  total_pago: number;
  saldo_restante: number;
}

export interface PagamentoContaPagar {
  pagamento_conta_pagar_id: number;
  conta_pagar_id: number;
  usuario_id?: number | null;
  caixa_id?: number | null;
  forma_pagamento: "dinheiro" | "pix" | "credito" | "debito";
  valor: number;
  pago_em: string;
  observacao?: string | null;
  criado_em: string;
}