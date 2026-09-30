import db from "../database/DB";

export interface Cliente {
  id: number;
  nome: string;
  documento?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  ativo: number;
}

export const ClienteModel = {
  listar(): Cliente[] {
    return db.prepare("SELECT * FROM clientes WHERE ativo = 1 ORDER BY nome").all() as Cliente[];
  },
  criar(d: Partial<Cliente>) {
    const r = db
      .prepare("INSERT INTO clientes (nome, documento, telefone, email, endereco) VALUES (?, ?, ?, ?, ?)")
      .run(d.nome, d.documento ?? null, d.telefone ?? null, d.email ?? null, d.endereco ?? null);
    return Number(r.lastInsertRowid);
  },
  atualizar(id: number, d: Partial<Cliente>) {
    db.prepare("UPDATE clientes SET nome = ?, documento = ?, telefone = ?, email = ?, endereco = ? WHERE id = ?").run(
      d.nome, d.documento ?? null, d.telefone ?? null, d.email ?? null, d.endereco ?? null, id
    );
  },
  remover(id: number) {
    db.prepare("UPDATE clientes SET ativo = 0 WHERE id = ?").run(id);
  },
};
