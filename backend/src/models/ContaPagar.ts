import db from "../database/DB";

export const ContaPagarModel = {
  listar() {
    return db
      .prepare("SELECT id, descricao, valor, vencimento, paga FROM contas_pagar ORDER BY vencimento")
      .all()
      .map((c: any) => ({ ...c, paga: !!c.paga }));
  },
  criar(descricao: string, valor: number, vencimento: string) {
    const r = db.prepare("INSERT INTO contas_pagar (descricao, valor, vencimento) VALUES (?, ?, ?)").run(descricao, valor, vencimento);
    return Number(r.lastInsertRowid);
  },
  pagar(id: number) {
    db.prepare("UPDATE contas_pagar SET paga = 1 WHERE id = ?").run(id);
  },
};
