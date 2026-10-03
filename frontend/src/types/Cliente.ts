export interface Cliente {
  cliente_id: number;
  nome: string;
  documento?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  nr?: number;
  bairro?: string;
  valor_a_pagar: number;
  ativo: boolean;
  criado_em?: string;
}