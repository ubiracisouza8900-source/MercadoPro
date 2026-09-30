import db from "../database/DB";

export interface Produto {
  produtoId: number;
  nome: string;
  categoriaId: number | null;
  categoriaNome: string | null;
  precoCusto: number;
  precoVenda: number;
  quantidadeEstoque: number;
  estoqueMinimo: number;
  codigoBarras: string | null;
  ativo: boolean;
}

const SELECT = `
  SELECT
    p.produto_id AS "produtoId",
    p.nome,
    p.categoria_id AS "categoriaId",
    c.nome AS "categoriaNome",
    p.preco_custo::double precision AS "precoCusto",
    p.preco_venda::double precision AS "precoVenda",
    p.quantidade_estoque::double precision AS "quantidadeEstoque",
    p.estoque_minimo::double precision AS "estoqueMinimo",
    p.codigo_barras AS "codigoBarras",
    p.ativo
  FROM mercado_pro.produtos p
  LEFT JOIN mercado_pro.categorias c
    ON c.categoria_id = p.categoria_id
`;

export const ProdutoModel = {
  async listar(): Promise<Produto[]> {
    const resultado = await db.query(`
      ${SELECT}
      WHERE p.ativo = TRUE
      ORDER BY p.nome
    `);

    return resultado.rows;
  },

  async buscarPorId(
    id: number
  ): Promise<Produto | undefined> {
    const resultado = await db.query(
      `
      ${SELECT}
      WHERE p.produto_id = $1
      `,
      [id]
    );

    return resultado.rows[0];
  },

  async buscarPorCodigo(
    codigo: string
  ): Promise<Produto | undefined> {
    const resultado = await db.query(
      `
      ${SELECT}
      WHERE p.codigo_barras = $1
      `,
      [codigo]
    );

    return resultado.rows[0];
  },

  async criar(
    d: Partial<Produto>
  ): Promise<number> {
    const nome = d.nome?.trim();
    const categoriaId = d.categoriaId ?? null;
    const precoCusto = Number(
      d.precoCusto ?? 0
    );
    const precoVenda = Number(
      d.precoVenda
    );
    const quantidadeEstoque = Number(
      d.quantidadeEstoque ?? 0
    );
    const estoqueMinimo = Number(
      d.estoqueMinimo ?? 0
    );
    const codigoBarras =
      d.codigoBarras?.trim() || null;

    if (!nome) {
      throw new Error(
        "Nome do produto é obrigatório."
      );
    }

    if (
      !Number.isFinite(precoVenda) ||
      precoVenda < 0
    ) {
      throw new Error(
        "Preço de venda inválido."
      );
    }

    const resultado = await db.query(
      `
      INSERT INTO mercado_pro.produtos (
        nome,
        categoria_id,
        codigo_barras,
        preco_custo,
        preco_venda,
        quantidade_estoque,
        estoque_minimo
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7
      )
      RETURNING produto_id
      `,
      [
        nome,
        categoriaId,
        codigoBarras,
        precoCusto,
        precoVenda,
        quantidadeEstoque,
        estoqueMinimo,
      ]
    );

    return resultado.rows[0].produto_id;
  },

  async atualizar(
    id: number,
    d: Partial<Produto>
  ): Promise<void> {
    await db.query(
      `
      UPDATE mercado_pro.produtos
      SET
        nome = $1,
        categoria_id = $2,
        codigo_barras = $3,
        preco_custo = $4,
        preco_venda = $5,
        quantidade_estoque = $6,
        estoque_minimo = $7
      WHERE produto_id = $8
      `,
      [
        d.nome,
        d.categoriaId ?? null,
        d.codigoBarras ?? null,
        Number(d.precoCusto ?? 0),
        Number(d.precoVenda),
        Number(d.quantidadeEstoque ?? 0),
        Number(d.estoqueMinimo ?? 0),
        id,
      ]
    );
  },

  async remover(
    id: number
  ): Promise<void> {
    await db.query(
      `
      UPDATE mercado_pro.produtos
      SET ativo = FALSE
      WHERE produto_id = $1
      `,
      [id]
    );
  },

  async baixarEstoque(
    id: number,
    quantidade: number
  ): Promise<void> {
    await db.query(
      `
      UPDATE mercado_pro.produtos
      SET quantidade_estoque =
        quantidade_estoque - $1
      WHERE produto_id = $2
      `,
      [quantidade, id]
    );
  },
};