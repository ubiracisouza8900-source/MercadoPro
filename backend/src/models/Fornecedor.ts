import db from "../database/DB";

export interface Fornecedor {
  fornecedor_id: number;
  nome: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  produtos_fornecidos?: string;
  ativo: boolean;
  criado_em?: string;
}

export const FornecedorModel = {
  async listar(): Promise<Fornecedor[]> {
    const resultado = await db.query(
      `SELECT
        fornecedor_id,
        nome,
        cnpj,
        telefone,
        email,
        endereco,
        produtos_fornecidos,
        ativo,
        criado_em
       FROM mercado_pro.fornecedores
       WHERE ativo = TRUE
       ORDER BY nome`
    );

    return resultado.rows as Fornecedor[];
  },

  async criar(d: Partial<Fornecedor>): Promise<Fornecedor> {
    const resultado = await db.query(
      `INSERT INTO mercado_pro.fornecedores (
        nome,
        cnpj,
        telefone,
        email,
        endereco,
        produtos_fornecidos
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        fornecedor_id,
        nome,
        cnpj,
        telefone,
        email,
        endereco,
        produtos_fornecidos,
        ativo,
        criado_em`,
      [
        d.nome,
        d.cnpj ?? null,
        d.telefone ?? null,
        d.email ?? null,
        d.endereco ?? null,
        d.produtos_fornecidos ?? null,
      ]
    );

    return resultado.rows[0] as Fornecedor;
  },

  async atualizar(
    fornecedor_id: number,
    d: Partial<Fornecedor>
  ): Promise<void> {
    await db.query(
      `UPDATE mercado_pro.fornecedores
       SET
        nome = $1,
        cnpj = $2,
        telefone = $3,
        email = $4,
        endereco = $5,
        produtos_fornecidos = $6
       WHERE fornecedor_id = $7`,
      [
        d.nome,
        d.cnpj ?? null,
        d.telefone ?? null,
        d.email ?? null,
        d.endereco ?? null,
        d.produtos_fornecidos ?? null,
        fornecedor_id,
      ]
    );
  },

  async remover(fornecedor_id: number): Promise<void> {
    await db.query(
      `UPDATE mercado_pro.fornecedores
       SET ativo = FALSE
       WHERE fornecedor_id = $1`,
      [fornecedor_id]
    );
  },
};