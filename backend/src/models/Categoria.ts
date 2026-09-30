import db from "../database/DB";

export interface Categoria {
  categoriaId: number;
  nome: string;
  ativo: boolean;
}

export const CategoriaModel = {
async listar(): Promise<Categoria[]> {
  const resultado = await db.query(`
    SELECT
      categoria_id AS "categoriaId",
      nome,
      ativo
    FROM mercado_pro.categorias
    WHERE ativo = TRUE
    ORDER BY nome
  `);

  return resultado.rows;
},

  async criar(nome: string): Promise<Categoria> {
    const resultado = await db.query(
      `
      INSERT INTO mercado_pro.categorias (
        nome
      )
      VALUES ($1)
      RETURNING
        categoria_id AS "categoriaId",
        nome,
        ativo
      `,
      [nome]
    );

    return resultado.rows[0];
  },

  async atualizar(
    id: number,
    nome: string
  ): Promise<void> {
    await db.query(
      `
      UPDATE mercado_pro.categorias
      SET nome = $1
      WHERE categoria_id = $2
      `,
      [nome, id]
    );
  },

  async remover(id: number): Promise<void> {
    await db.query(
      `
      UPDATE mercado_pro.categorias
      SET ativo = FALSE
      WHERE categoria_id = $1
      `,
      [id]
    );
  },
};