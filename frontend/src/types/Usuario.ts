export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: "admin" | "operador" | "financeiro";
}
