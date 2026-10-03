export interface Fornecedor {
  fornecedor_id: number;
  nome: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  produtos_fornecidos?: string;
  ativo: boolean;
  criado_em?: string;
}