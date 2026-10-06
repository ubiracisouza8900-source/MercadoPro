import db from "../database/DB";

export interface Caixa {
  caixa_id: number;
  usuario_id: number;
  status: string;
  saldo_inicial: number;
  saldo_final?: number;
  valor_esperado?: number;
  valor_informado?: number;
  diferenca?: number;
  aberto_em?: string;
  fechado_em?: string;
}

export const CaixaModel = {
  async atual(): Promise<Caixa | undefined> {
    const resultado = await db.query<Caixa>(
      `
      SELECT *
      FROM mercado_pro.caixa
      WHERE status = 'aberto'
      ORDER BY caixa_id DESC
      LIMIT 1
      `
    );

    return resultado.rows[0];
  },

  async abrir(
    usuarioId: number,
    saldoInicial: number
  ): Promise<Caixa> {
    const resultado = await db.query<Caixa>(
      `
      INSERT INTO mercado_pro.caixa (
        usuario_id,
        status,
        saldo_inicial,
        valor_esperado,
        aberto_em
      )
      VALUES (
        $1,
        'aberto',
        $2,
        $2,
        CURRENT_TIMESTAMP
      )
      RETURNING *
      `,
      [
        usuarioId,
        saldoInicial,
      ]
    );

    return resultado.rows[0];
  },

  async fechar(
    caixaId: number,
    valorEsperado: number,
    valorInformado: number,
    diferenca: number
  ): Promise<Caixa | undefined> {
    const resultado = await db.query<Caixa>(
      `
      UPDATE mercado_pro.caixa
      SET
        status = 'fechado',
        valor_esperado = $1,
        valor_informado = $2,
        diferenca = $3,
        saldo_final = $2,
        fechado_em = CURRENT_TIMESTAMP
      WHERE caixa_id = $4
      RETURNING *
      `,
      [
        valorEsperado,
        valorInformado,
        diferenca,
        caixaId,
      ]
    );

    return resultado.rows[0];
  },
};
