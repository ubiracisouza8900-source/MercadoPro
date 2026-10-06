import db from "../database/DB";

export interface ItemVendaInput {
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
}

interface ItemVendaBanco {
  itemVendaId: number | string;
  produtoId: number | string;
  produtoNome: string;
  codigoBarras: string | null;
  quantidade: number | string;
  precoUnitario: number | string;
  subtotal: number | string;
}

interface VendaBanco {
  id: number | string;
  clienteId: number | string | null;
  usuarioId: number | string;
  caixaId: number | string | null;
  total: number | string;
  formaPagamento: string;
  dataVenda: Date | string;
  clienteNome: string | null;
  vencimento: Date | string | null;
}

export const VendaModel = {
  async criar(
    clienteId: number | null,
    usuarioId: number,
    caixaId: number,
    formaPagamento: string,
    itens: ItemVendaInput[],
    vencimento?: string
  ) {
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      let total = 0;

      for (const item of itens) {
        if (item.quantidade <= 0) {
          throw new Error("Quantidade inválida.");
        }

        if (item.precoUnitario < 0) {
          throw new Error("Preço inválido.");
        }

        const produto = await client.query(
          `
          SELECT
            produto_id,
            quantidade_estoque,
            preco_venda
          FROM mercado_pro.produtos
          WHERE produto_id = $1
            AND ativo = TRUE
          FOR UPDATE
          `,
          [item.produtoId]
        );

        if (produto.rows.length === 0) {
          throw new Error(
            `Produto ${item.produtoId} não encontrado.`
          );
        }

        const estoqueAtual = Number(
          produto.rows[0].quantidade_estoque
        );

        if (item.quantidade > estoqueAtual) {
          throw new Error(
            `Estoque insuficiente para o produto ${item.produtoId}.`
          );
        }

        total +=
          item.quantidade * item.precoUnitario;
      }

      const venda = await client.query(
        `
        INSERT INTO mercado_pro.vendas (
          cliente_id,
          usuario_id,
          caixa_id,
          total,
          forma_pagamento
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
          venda_id,
          cliente_id,
          usuario_id,
          caixa_id,
          total,
          forma_pagamento,
          data_venda
        `,
        [
          clienteId,
          usuarioId,
          caixaId,
          total,
          formaPagamento,
        ]
      );

      const vendaCriada = venda.rows[0];

      for (const item of itens) {
        const subtotal =
          item.quantidade * item.precoUnitario;

        await client.query(
          `
          INSERT INTO mercado_pro.itens_venda (
            venda_id,
            produto_id,
            quantidade,
            preco_unitario,
            subtotal
          )
          VALUES ($1, $2, $3, $4, $5)
          `,
          [
            vendaCriada.venda_id,
            item.produtoId,
            item.quantidade,
            item.precoUnitario,
            subtotal,
          ]
        );

        await client.query(
          `
          UPDATE mercado_pro.produtos
          SET quantidade_estoque =
            quantidade_estoque - $1
          WHERE produto_id = $2
          `,
          [
            item.quantidade,
            item.produtoId,
          ]
        );
      }

      if (formaPagamento === "fiado") {
        if (!clienteId) {
          throw new Error(
            "Cliente é obrigatório para venda fiado."
          );
        }

        if (!vencimento) {
          throw new Error(
            "Data de vencimento é obrigatória para venda fiado."
          );
        }

        await client.query(
          `
          INSERT INTO mercado_pro.contas_receber (
            cliente_id,
            venda_id,
            descricao,
            valor,
            vencimento
          )
          VALUES ($1, $2, $3, $4, $5)
          `,
          [
            clienteId,
            vendaCriada.venda_id,
            `Venda #${vendaCriada.venda_id}`,
            total,
            vencimento,
          ]
        );
      } else {
        await client.query(
          `
          INSERT INTO mercado_pro.pagamentos_venda (
            venda_id,
            forma_pagamento,
            valor
          )
          VALUES ($1, $2, $3)
          `,
          [
            vendaCriada.venda_id,
            formaPagamento,
            total,
          ]
        );

        await client.query(
          `
          INSERT INTO mercado_pro.movimentacoes_caixa (
            caixa_id,
            usuario_id,
            tipo,
            descricao,
            valor,
            forma_pagamento
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          `,
          [
            caixaId,
            usuarioId,
            "venda",
            `Venda #${vendaCriada.venda_id}`,
            total,
            formaPagamento,
          ]
        );

        await client.query(
          `
          UPDATE mercado_pro.caixa
          SET valor_esperado =
            COALESCE(valor_esperado, saldo_inicial)
            +
            CASE
              WHEN $1 = 'dinheiro' THEN $2
              ELSE 0
            END
          WHERE caixa_id = $3
            AND status = 'aberto'
          `,
          [
            formaPagamento,
            total,
            caixaId,
          ]
        );
      }

      await client.query("COMMIT");

      return {
        id: Number(vendaCriada.venda_id),

        clienteId:
          vendaCriada.cliente_id !== null
            ? Number(vendaCriada.cliente_id)
            : null,

        usuarioId:
          Number(vendaCriada.usuario_id),

        caixaId:
          vendaCriada.caixa_id !== null
            ? Number(vendaCriada.caixa_id)
            : null,

        total:
          Number(vendaCriada.total),

        formaPagamento:
          String(vendaCriada.forma_pagamento),

        dataVenda:
          vendaCriada.data_venda,
      };
    } catch (erro) {
      await client.query("ROLLBACK");
      throw erro;
    } finally {
      client.release();
    }
  },

  async buscarPorId(id: number) {
    const vendaResultado =
      await db.query<VendaBanco>(
        `
        SELECT
          v.venda_id AS "id",
          v.cliente_id AS "clienteId",
          v.usuario_id AS "usuarioId",
          v.caixa_id AS "caixaId",
          v.total,
          v.forma_pagamento AS "formaPagamento",
          v.data_venda AS "dataVenda",
          c.nome AS "clienteNome",
          r.vencimento AS "vencimento"
        FROM mercado_pro.vendas v
        LEFT JOIN mercado_pro.clientes c
          ON c.cliente_id = v.cliente_id
        LEFT JOIN mercado_pro.contas_receber r
          ON r.venda_id = v.venda_id
        WHERE v.venda_id = $1
        `,
        [id]
      );

    if (vendaResultado.rows.length === 0) {
      return null;
    }

    const venda = vendaResultado.rows[0];

    const itensResultado =
      await db.query<ItemVendaBanco>(
        `
        SELECT
          iv.item_venda_id AS "itemVendaId",
          iv.produto_id AS "produtoId",
          p.nome AS "produtoNome",
          p.codigo_barras AS "codigoBarras",
          iv.quantidade,
          iv.preco_unitario AS "precoUnitario",
          iv.subtotal
        FROM mercado_pro.itens_venda iv
        INNER JOIN mercado_pro.produtos p
          ON p.produto_id = iv.produto_id
        WHERE iv.venda_id = $1
        ORDER BY iv.item_venda_id
        `,
        [id]
      );

    const itens: ItemVendaBanco[] =
      itensResultado.rows;

    return {
      id:
        Number(venda.id),

      clienteId:
        venda.clienteId !== null
          ? Number(venda.clienteId)
          : null,

      clienteNome:
        venda.clienteNome ?? null,

      usuarioId:
        Number(venda.usuarioId),

      caixaId:
        venda.caixaId !== null
          ? Number(venda.caixaId)
          : null,

      total:
        Number(venda.total),

      formaPagamento:
        venda.formaPagamento,

      dataVenda:
        venda.dataVenda,

      vencimento:
        venda.vencimento ?? null,

      itens: itens.map((item) => ({
        itemVendaId:
          Number(item.itemVendaId),

        produtoId:
          Number(item.produtoId),

        produtoNome:
          item.produtoNome,

        codigoBarras:
          item.codigoBarras !== null
            ? String(item.codigoBarras)
            : null,

        quantidade:
          Number(item.quantidade),

        precoUnitario:
          Number(item.precoUnitario),

        subtotal:
          Number(item.subtotal),
      })),
    };
  },

  async listar() {
    const resultado = await db.query(`
      SELECT
        venda_id AS "id",
        cliente_id AS "clienteId",
        usuario_id AS "usuarioId",
        caixa_id AS "caixaId",
        total,
        forma_pagamento AS "formaPagamento",
        data_venda AS "dataVenda"
      FROM mercado_pro.vendas
      ORDER BY venda_id DESC
    `);

    return resultado.rows;
  },

  async totalGeral(): Promise<number> {
    const resultado = await db.query(`
      SELECT
        COALESCE(SUM(total), 0) AS total
      FROM mercado_pro.vendas
    `);

    return Number(resultado.rows[0].total);
  },
};