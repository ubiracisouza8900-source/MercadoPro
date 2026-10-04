import db from "../database/DB";

export interface ItemVendaInput {
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
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

      /*
       * VENDA FIADO
       *
       * Não é um pagamento recebido.
       * Por isso não entra como recebimento no caixa.
       * Apenas cria a conta a receber vinculada
       * ao cliente e à venda.
       */
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
        /*
         * PAGAMENTO NORMAL
         *
         * Dinheiro, PIX, crédito e débito
         * são registrados como pagamento da venda.
         */
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

        /*
         * Registra a movimentação da venda no caixa.
         */
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

        /*
         * Somente dinheiro aumenta o valor físico
         * esperado no caixa.
         */
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
        id: vendaCriada.venda_id,
        clienteId: vendaCriada.cliente_id,
        usuarioId: vendaCriada.usuario_id,
        caixaId: vendaCriada.caixa_id,
        total: Number(vendaCriada.total),
        formaPagamento:
          vendaCriada.forma_pagamento,
        dataVenda: vendaCriada.data_venda,
      };
    } catch (erro) {
      await client.query("ROLLBACK");
      throw erro;
    } finally {
      client.release();
    }
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