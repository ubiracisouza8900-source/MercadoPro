import db from "../database/DB";

export const CaixaModel = {
  atual() {
    return db.prepare("SELECT * FROM caixa ORDER BY id DESC LIMIT 1").get() as
      | { id: number; status: string; saldo_inicial: number; aberto_em: string }
      | undefined;
  },
  abrir(saldoInicial: number) {
    db.prepare("INSERT INTO caixa (status, saldo_inicial, aberto_em) VALUES ('aberto', ?, CURRENT_TIMESTAMP)").run(saldoInicial);
  },
  fechar(id: number) {
    db.prepare("UPDATE caixa SET status = 'fechado', fechado_em = CURRENT_TIMESTAMP WHERE id = ?").run(id);
  },
  totalVendasDesde(dataInicio: string): number {
    const r = db
      .prepare("SELECT COALESCE(SUM(total), 0) AS total FROM vendas WHERE data_venda >= ?")
      .get(dataInicio) as { total: number };
    return r.total;
  },
};
