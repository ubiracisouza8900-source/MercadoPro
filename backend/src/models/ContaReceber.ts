import db from "../database/DB";

export interface ContaReceber {
  contaReceberId: number;
  clienteId: number;
  vendaId: number | null;
  descricao: string;
  valor: number;
  vencimento: string;
  recebida: boolean;
  recebidaEm: string | null;
}

export const ContaReceberModel = {
  async listar(): Promise<ContaReceber[]> {
    const resultado = await db.query(`
      SELECT
        r.conta_receber_id AS "contaReceberId",
        r.cliente_id AS "clienteId",
        r.venda_id AS "vendaId",
        r.descricao,
        r.valor,
        r.vencimento,
        r.recebida,
        r.recebida_em AS "recebidaEm",
        c.nome AS "clienteNome"
      FROM mercado_pro.contas_receber r
      LEFT JOIN mercado_pro.clientes c
        ON c.cliente_id = r.cliente_id
      ORDER BY r.vencimento ASC, r.conta_receber_id DESC
    `);

    return resultado.rows.map((conta: any) => ({
      ...conta,
      valor: Number(conta.valor),
      recebida: Boolean(conta.recebida),
    }));
  },

  async criar(
    clienteId: number,
    valor: number,
    vencimento: string,
    vendaId?: number
  ) {
    const resultado = await db.query(
      `
      INSERT INTO mercado_pro.contas_receber (
        cliente_id,
        venda_id,
        descricao,
        valor,
        vencimento
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        conta_receber_id AS "contaReceberId",
        cliente_id AS "clienteId",
        venda_id AS "vendaId",
        descricao,
        valor,
        vencimento,
        recebida,
        recebida_em AS "recebidaEm"
      `,
      [
        clienteId,
        vendaId ?? null,
        vendaId
          ? `Venda #${vendaId}`
          : "Conta a receber",
        valor,
        vencimento,
      ]
    );

    const conta = resultado.rows[0];

    return {
      ...conta,
      valor: Number(conta.valor),
      recebida: Boolean(conta.recebida),
    };
  },

  async receber(id: number) {
    const resultado = await db.query(
      `
      UPDATE mercado_pro.contas_receber
      SET
        recebida = TRUE,
        recebida_em = CURRENT_TIMESTAMP
      WHERE conta_receber_id = $1
        AND recebida = FALSE
      RETURNING
        conta_receber_id AS "contaReceberId",
        cliente_id AS "clienteId",
        venda_id AS "vendaId",
        descricao,
        valor,
        vencimento,
        recebida,
        recebida_em AS "recebidaEm"
      `,
      [id]
    );

    if (resultado.rows.length === 0) {
      throw new Error(
        "Conta a receber não encontrada ou já recebida."
      );
    }

    const conta = resultado.rows[0];

    return {
      ...conta,
      valor: Number(conta.valor),
      recebida: Boolean(conta.recebida),
    };
  },
};