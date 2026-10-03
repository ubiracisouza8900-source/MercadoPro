import db from "../database/DB";

export interface Compra {
  compra_id: number;
  fornecedor_id: number | null;
  fornecedor_nome?: string;
  fornecedor_cnpj?: string;
  usuario_id: number;
  total: number;
  data_compra: string;
  data_vencimento: string | null;
  boleto_arquivo: string | null;
}

export const CompraModel = {
  async listar(): Promise<Compra[]> {
    const resultado = await db.query(
      `SELECT
        c.compra_id,
        c.fornecedor_id,
        f.nome AS fornecedor_nome,
        f.cnpj AS fornecedor_cnpj,
        c.usuario_id,
        c.total,
        c.data_compra,
        c.data_vencimento,
        c.boleto_arquivo
       FROM mercado_pro.compras c
       LEFT JOIN mercado_pro.fornecedores f
         ON f.fornecedor_id = c.fornecedor_id
       ORDER BY c.compra_id DESC`
    );

    return resultado.rows as Compra[];
  },

  async criar(
    fornecedor_id: number,
    usuario_id: number,
    total: number,
    data_compra: string,
    data_vencimento: string | null,
    boleto_arquivo: string | null
  ): Promise<Compra> {
    const resultado = await db.query(
      `INSERT INTO mercado_pro.compras (
        fornecedor_id,
        usuario_id,
        total,
        data_compra,
        data_vencimento,
        boleto_arquivo
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        compra_id,
        fornecedor_id,
        usuario_id,
        total,
        data_compra,
        data_vencimento,
        boleto_arquivo`,
      [
        fornecedor_id,
        usuario_id,
        total,
        data_compra,
        data_vencimento,
        boleto_arquivo,
      ]
    );

    return resultado.rows[0] as Compra;
  },
};