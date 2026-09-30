import db from "../database/DB";

export const CompraModel = {
  listar() {
    return db
      .prepare(
        `SELECT c.id, f.nome AS fornecedorNome, c.total, c.data
         FROM compras c LEFT JOIN fornecedores f ON f.id = c.fornecedor_id ORDER BY c.id DESC`
      )
      .all();
  },
  criar(fornecedorId: number, total: number) {
    const r = db.prepare("INSERT INTO compras (fornecedor_id, total) VALUES (?, ?)").run(fornecedorId, total);
    return Number(r.lastInsertRowid);
  },
};
