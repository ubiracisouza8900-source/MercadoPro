import db from "../database/DB";

export interface ResumoRelatorio {
  totalVendas: number;
  quantidadeVendas: number;
  totalCompras: number;
  contasReceber: number;
  contasPagar: number;
  valorEstoque: number;
}

export interface VendaPorPagamento {
  formaPagamento: string;
  quantidade: number;
  valor: number;
}

export interface ProdutoMaisVendido {
  produtoId: number;
  produtoNome: string;
  quantidade: number;
  valor: number;
}

export const RelatorioModel = {
  async resumo(
    dataInicio?: string,
    dataFim?: string
  ): Promise<ResumoRelatorio> {
    const resultado = await db.query(
      `
      SELECT
        (
          SELECT COALESCE(SUM(v.total), 0)
          FROM mercado_pro.vendas v
          WHERE
            ($1::date IS NULL OR v.data_venda::date >= $1::date)
            AND
            ($2::date IS NULL OR v.data_venda::date <= $2::date)
        ) AS "totalVendas",

        (
          SELECT COUNT(*)
          FROM mercado_pro.vendas v
          WHERE
            ($1::date IS NULL OR v.data_venda::date >= $1::date)
            AND
            ($2::date IS NULL OR v.data_venda::date <= $2::date)
        ) AS "quantidadeVendas",

        (
          SELECT COALESCE(SUM(c.total), 0)
          FROM mercado_pro.compras c
          WHERE
            ($1::date IS NULL OR c.data_compra::date >= $1::date)
            AND
            ($2::date IS NULL OR c.data_compra::date <= $2::date)
        ) AS "totalCompras",

        (
          SELECT COALESCE(SUM(cr.valor), 0)
          FROM mercado_pro.contas_receber cr
          WHERE cr.recebida = FALSE
        ) AS "contasReceber",

        (
          SELECT COALESCE(SUM(cp.valor), 0)
          FROM mercado_pro.contas_pagar cp
          WHERE cp.status <> 'pago'
        ) AS "contasPagar",

        (
          SELECT COALESCE(
            SUM(
              p.quantidade_estoque * p.preco_custo
            ),
            0
          )
          FROM mercado_pro.produtos p
          WHERE p.ativo = TRUE
        ) AS "valorEstoque"
      `,
      [dataInicio || null, dataFim || null]
    );

    const dados = resultado.rows[0];

    return {
      totalVendas: Number(dados.totalVendas),
      quantidadeVendas: Number(
        dados.quantidadeVendas
      ),
      totalCompras: Number(dados.totalCompras),
      contasReceber: Number(
        dados.contasReceber
      ),
      contasPagar: Number(
        dados.contasPagar
      ),
      valorEstoque: Number(
        dados.valorEstoque
      ),
    };
  },

  async vendasPorPagamento(
    dataInicio?: string,
    dataFim?: string
  ): Promise<VendaPorPagamento[]> {
    const resultado = await db.query(
      `
      SELECT
        pv.forma_pagamento AS "formaPagamento",
        COUNT(*)::integer AS quantidade,
        COALESCE(SUM(pv.valor), 0) AS valor
      FROM mercado_pro.pagamentos_venda pv
      INNER JOIN mercado_pro.vendas v
        ON v.venda_id = pv.venda_id
      WHERE
        ($1::date IS NULL OR v.data_venda::date >= $1::date)
        AND
        ($2::date IS NULL OR v.data_venda::date <= $2::date)
      GROUP BY pv.forma_pagamento
      ORDER BY valor DESC
      `,
      [dataInicio || null, dataFim || null]
    );

    return resultado.rows.map(
      (linha) => ({
        formaPagamento:
          String(linha.formaPagamento),
        quantidade:
          Number(linha.quantidade),
        valor:
          Number(linha.valor),
      })
    );
  },

  async produtosMaisVendidos(
    dataInicio?: string,
    dataFim?: string
  ): Promise<ProdutoMaisVendido[]> {
    const resultado = await db.query(
      `
      SELECT
        p.produto_id AS "produtoId",
        p.nome AS "produtoNome",
        COALESCE(
          SUM(iv.quantidade),
          0
        ) AS quantidade,
        COALESCE(
          SUM(iv.subtotal),
          0
        ) AS valor
      FROM mercado_pro.itens_venda iv
      INNER JOIN mercado_pro.vendas v
        ON v.venda_id = iv.venda_id
      INNER JOIN mercado_pro.produtos p
        ON p.produto_id = iv.produto_id
      WHERE
        ($1::date IS NULL OR v.data_venda::date >= $1::date)
        AND
        ($2::date IS NULL OR v.data_venda::date <= $2::date)
      GROUP BY
        p.produto_id,
        p.nome
      ORDER BY quantidade DESC
      LIMIT 10
      `,
      [dataInicio || null, dataFim || null]
    );

    return resultado.rows.map(
      (linha) => ({
        produtoId:
          Number(linha.produtoId),
        produtoNome:
          String(linha.produtoNome),
        quantidade:
          Number(linha.quantidade),
        valor:
          Number(linha.valor),
      })
    );
  },
};