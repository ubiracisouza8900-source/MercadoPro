export interface Cliente {
  id: number;
  nome: string;
  documento?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  ativo: boolean;
}
