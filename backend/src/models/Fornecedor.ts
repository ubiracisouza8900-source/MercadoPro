import db from "../database/DB";

export interface Fornecedor {
  id: number;
  nome: string;
  cnpj?: string;
  telefone?: string;
}

export const FornecedorModel = {
  listar(): Fornecedor[] {
    return db.prepare("SELECT * FROM fornecedores ORDER BY nome").all() as Fornecedor[];
  },
  criar(d: Partial<Fornecedor>) {
    const r = db
      .prepare("INSERT INTO fornecedores (nome, cnpj, telefone) VALUES (?, ?, ?)")
      .run(d.nome, d.cnpj ?? null, d.telefone ?? null);
    return Number(r.lastInsertRowid);
  },
  atualizar(id: number, d: Partial<Fornecedor>) {
    db.prepare("UPDATE fornecedores SET nome = ?, cnpj = ?, telefone = ? WHERE id = ?").run(
      d.nome, d.cnpj ?? null, d.telefone ?? null, id
    );
  },
  remover(id: number) {
    db.prepare("DELETE FROM fornecedores WHERE id = ?").run(id);
  },
};
