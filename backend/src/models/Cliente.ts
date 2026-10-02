import db from "../database/DB";

export interface Cliente {
  cliente_id: number;
  nome: string;
  documento?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  nr?: number;
  bairro?: string;
  valor_a_pagar: number;
  ativo: boolean;
  criado_em?: string;
}

export const ClienteModel = {
  async listar(): Promise<Cliente[]> {
    const resultado = await db.query(
      `SELECT
        cliente_id,
        nome,
        documento,
        telefone,
        email,
        endereco,
        nr,
        bairro,
        valor_a_pagar,
        ativo,
        criado_em
       FROM mercado_pro.clientes
       WHERE ativo = TRUE
       ORDER BY nome`
    );

    return resultado.rows as Cliente[];
  },

  async criar(d: Partial<Cliente>): Promise<Cliente> {
    const resultado = await db.query(
      `INSERT INTO mercado_pro.clientes (
        nome,
        documento,
        telefone,
        email,
        endereco,
        nr,
        bairro,
        valor_a_pagar
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        cliente_id,
        nome,
        documento,
        telefone,
        email,
        endereco,
        nr,
        bairro,
        valor_a_pagar,
        ativo,
        criado_em`,
      [
        d.nome,
        d.documento ?? null,
        d.telefone ?? null,
        d.email ?? null,
        d.endereco ?? null,
        d.nr ?? null,
        d.bairro ?? null,
        d.valor_a_pagar ?? 0,
      ]
    );

    return resultado.rows[0] as Cliente;
  },

  async atualizar(
    cliente_id: number,
    d: Partial<Cliente>
  ): Promise<void> {
    await db.query(
      `UPDATE mercado_pro.clientes
       SET
        nome = $1,
        documento = $2,
        telefone = $3,
        email = $4,
        endereco = $5,
        nr = $6,
        bairro = $7,
        valor_a_pagar = $8
       WHERE cliente_id = $9`,
      [
        d.nome,
        d.documento ?? null,
        d.telefone ?? null,
        d.email ?? null,
        d.endereco ?? null,
        d.nr ?? null,
        d.bairro ?? null,
        d.valor_a_pagar ?? 0,
        cliente_id,
      ]
    );
  },

  async remover(cliente_id: number): Promise<void> {
    await db.query(
      `UPDATE mercado_pro.clientes
       SET ativo = FALSE
       WHERE cliente_id = $1`,
      [cliente_id]
    );
  },
};