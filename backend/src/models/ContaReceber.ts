import db from "../database/DB";

export const ContaReceberModel = {
  listar() {
    return db
      .prepare(
        `SELECT r.id, c.nome AS clienteNome, r.valor, r.vencimento, r.recebida
         FROM contas_receber r LEFT JOIN clientes c ON c.id = r.cliente_id ORDER BY r.vencimento`
      )
      .all()
      .map((c: any) => ({ ...c, recebida: !!c.recebida }));
  },
  criar(clienteId: number, valor: number, vencimento: string) {
    const r = db.prepare("INSERT INTO contas_receber (cliente_id, valor, vencimento) VALUES (?, ?, ?)").run(clienteId, valor, vencimento);
    return Number(r.lastInsertRowid);
  },
  receber(id: number) {
    db.prepare("UPDATE contas_receber SET recebida = 1 WHERE id = ?").run(id);
  },
};
