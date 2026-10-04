import db from "../database/DB";

export interface MovimentacaoCaixa {
  movimentacao_id: number;
  caixa_id: number;
  usuario_id?: number;
  tipo: string;
  descricao?: string;
  valor: number;
  forma_pagamento?: string;
  criado_em?: string;
}

export const MovimentacaoCaixaModel = {
  async criar(
    caixaId: number,
    usuarioId: number,
    tipo: string,
    descricao: string,
    valor: number,
    formaPagamento?: string
  ): Promise<MovimentacaoCaixa> {
    const resultado = await db.query(
      `
      INSERT INTO mercado_pro.movimentacoes_caixa (
        caixa_id,
        usuario_id,
        tipo,
        descricao,
        valor,
        forma_pagamento
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6
      )
      RETURNING
        movimentacao_id,
        caixa_id,
        usuario_id,
        tipo,
        descricao,
        valor,
        forma_pagamento,
        criado_em
      `,
      [
        caixaId,
        usuarioId,
        tipo,
        descricao,
        valor,
        formaPagamento ?? null,
      ]
    );

    return resultado.rows[0] as MovimentacaoCaixa;
  },

  async listarPorCaixa(
    caixaId: number
  ): Promise<MovimentacaoCaixa[]> {
    const resultado = await db.query(
      `
      SELECT
        movimentacao_id,
        caixa_id,
        usuario_id,
        tipo,
        descricao,
        valor,
        forma_pagamento,
        criado_em
      FROM mercado_pro.movimentacoes_caixa
      WHERE caixa_id = $1
      ORDER BY movimentacao_id DESC
      `,
      [caixaId]
    );

    return resultado.rows as MovimentacaoCaixa[];
  },
};