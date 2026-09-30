import db from "../database/DB";

export interface ItemVendaInput {
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
}

export const VendaModel = {
  /** Cria a venda, os itens e baixa o estoque, tudo em uma transação. */
  criar(clienteId: number | null, formaPagamento: string, itens: ItemVendaInput[]) {
    const total = itens.reduce((s, i) => s + i.quantidade * i.precoUnitario, 0);

    const transacao = db.transaction(() => {
      const venda = db
        .prepare("INSERT INTO vendas (cliente_id, total, forma_pagamento) VALUES (?, ?, ?)")
        .run(clienteId, total, formaPagamento);
      const vendaId = Number(venda.lastInsertRowid);

      const inserirItem = db.prepare(
        "INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)"
      );
      const baixar = db.prepare("UPDATE produtos SET quantidade_estoque = quantidade_estoque - ? WHERE id = ?");

      for (const item of itens) {
        inserirItem.run(vendaId, item.produtoId, item.quantidade, item.precoUnitario);
        baixar.run(item.quantidade, item.produtoId);
      }
      return { id: vendaId, total };
    });

    return transacao();
  },
  listar() {
    return db
      .prepare("SELECT id, cliente_id AS clienteId, total, forma_pagamento AS formaPagamento, data_venda AS dataVenda FROM vendas ORDER BY id DESC")
      .all();
  },
  totalGeral(): number {
    const r = db.prepare("SELECT COALESCE(SUM(total), 0) AS total FROM vendas").get() as { total: number };
    return r.total;
  },
};
