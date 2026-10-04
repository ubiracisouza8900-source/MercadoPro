import db from "../database/DB";

export interface Cliente {
  cliente_id: number;
  nome: string;
  documento?: string;
  telefone?: string;
  email?: string;
  cep?: string;
  endereco?: string;
  nr?: number;
  bairro?: string;
  cidade?: string;
  uf?: string;
  ativo: boolean;
  criado_em?: string;
}

export const ClienteModel = {
  async listar(): Promise<Cliente[]> {
    const resultado = await db.query(
      `
      SELECT
        cliente_id,
        nome,
        documento,
        telefone,
        email,
        cep,
        endereco,
        nr,
        bairro,
        cidade,
        uf,
        ativo,
        criado_em
      FROM mercado_pro.clientes
      WHERE ativo = TRUE
      ORDER BY nome
      `
    );

    return resultado.rows as Cliente[];
  },

  async criar(
    d: Partial<Cliente>
  ): Promise<Cliente> {
    const resultado = await db.query(
      `
      INSERT INTO mercado_pro.clientes (
        nome,
        documento,
        telefone,
        email,
        cep,
        endereco,
        nr,
        bairro,
        cidade,
        uf
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10
      )
      RETURNING
        cliente_id,
        nome,
        documento,
        telefone,
        email,
        cep,
        endereco,
        nr,
        bairro,
        cidade,
        uf,
        ativo,
        criado_em
      `,
      [
        d.nome,
        d.documento ?? null,
        d.telefone ?? null,
        d.email ?? null,
        d.cep ?? null,
        d.endereco ?? null,
        d.nr ?? null,
        d.bairro ?? null,
        d.cidade ?? null,
        d.uf ?? null,
      ]
    );

    return resultado.rows[0] as Cliente;
  },

  async atualizar(
    cliente_id: number,
    d: Partial<Cliente>
  ): Promise<void> {
    await db.query(
      `
      UPDATE mercado_pro.clientes
      SET
        nome = $1,
        documento = $2,
        telefone = $3,
        email = $4,
        cep = $5,
        endereco = $6,
        nr = $7,
        bairro = $8,
        cidade = $9,
        uf = $10
      WHERE cliente_id = $11
      `,
      [
        d.nome,
        d.documento ?? null,
        d.telefone ?? null,
        d.email ?? null,
        d.cep ?? null,
        d.endereco ?? null,
        d.nr ?? null,
        d.bairro ?? null,
        d.cidade ?? null,
        d.uf ?? null,
        cliente_id,
      ]
    );
  },

  async remover(
    cliente_id: number
  ): Promise<void> {
    await db.query(
      `
      UPDATE mercado_pro.clientes
      SET ativo = FALSE
      WHERE cliente_id = $1
      `,
      [cliente_id]
    );
  },
};