export interface Cliente {
  cliente_id: number;
  nome: string;
  documento?: string;
  telefone?: string;
  email?: string;
  cep?: string;
  endereco?: string;
  nr?: number;
  bairro?: string;
  cidade?: string;
  uf?: string;
  ativo: boolean;
  criado_em?: string;
}