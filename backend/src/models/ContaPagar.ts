import db from "../database/DB";

export interface ContaPagar {
  conta_pagar_id: number;
  fornecedor_id?: number | null;
  descricao: string;
  valor: number;
  vencimento: string;
  data_emissao?: string;
  status: string;
  criado_em?: string;
  atualizado_em?: string;
  total_pago?: number;
  saldo_restante?: number;
}

export interface PagamentoContaPagar {
  pagamento_conta_pagar_id: number;
  conta_pagar_id: number;
  usuario_id?: number | null;
  caixa_id?: number | null;
  forma_pagamento: string;
  valor: number;
  pago_em: string;
  observacao?: string | null;
  criado_em: string;
}

export const ContaPagarModel = {
  async listar(): Promise<ContaPagar[]> {
    const resultado = await db.query(`
      SELECT
        cp.conta_pagar_id,
        cp.fornecedor_id,
        cp.descricao,
        cp.valor,
        cp.vencimento,
        cp.data_emissao,
        cp.status,
        cp.criado_em,
        cp.atualizado_em,

        COALESCE(
          SUM(pc.valor),
          0
        ) AS total_pago,

        GREATEST(
          cp.valor - COALESCE(SUM(pc.valor), 0),
          0
        ) AS saldo_restante

      FROM mercado_pro.contas_pagar cp

      LEFT JOIN mercado_pro.pagamentos_contas_pagar pc
        ON pc.conta_pagar_id = cp.conta_pagar_id

      GROUP BY
        cp.conta_pagar_id

      ORDER BY
        cp.vencimento ASC
    `);

    return resultado.rows.map(
      (conta: {
        conta_pagar_id: number;
        fornecedor_id: number | null;
        descricao: string;
        valor: number | string;
        vencimento: string;
        data_emissao: string | null;
        status: string;
        criado_em: string;
        atualizado_em: string;
        total_pago: number | string;
        saldo_restante: number | string;
      }) => ({
        ...conta,
        valor: Number(conta.valor),
        total_pago: Number(conta.total_pago),
        saldo_restante: Number(
          conta.saldo_restante
        ),
      })
    );
  },

  async buscarPorId(
    id: number
  ): Promise<ContaPagar | undefined> {
    const resultado = await db.query(
      `
      SELECT
        cp.conta_pagar_id,
        cp.fornecedor_id,
        cp.descricao,
        cp.valor,
        cp.vencimento,
        cp.data_emissao,
        cp.status,
        cp.criado_em,
        cp.atualizado_em,

        COALESCE(
          SUM(pc.valor),
          0
        ) AS total_pago,

        GREATEST(
          cp.valor - COALESCE(SUM(pc.valor), 0),
          0
        ) AS saldo_restante

      FROM mercado_pro.contas_pagar cp

      LEFT JOIN mercado_pro.pagamentos_contas_pagar pc
        ON pc.conta_pagar_id = cp.conta_pagar_id

      WHERE cp.conta_pagar_id = $1

      GROUP BY
        cp.conta_pagar_id
      `,
      [id]
    );

    if (resultado.rows.length === 0) {
      return undefined;
    }

    const conta = resultado.rows[0];

    return {
      ...conta,
      valor: Number(conta.valor),
      total_pago: Number(conta.total_pago),
      saldo_restante: Number(conta.saldo_restante),
    };
  },

  async criar(
    fornecedorId: number | null,
    descricao: string,
    valor: number,
    vencimento: string,
    dataEmissao?: string
  ): Promise<ContaPagar> {
    const resultado = await db.query(
      `
      INSERT INTO mercado_pro.contas_pagar (
        fornecedor_id,
        descricao,
        valor,
        vencimento,
        data_emissao,
        status
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        COALESCE($5::date, CURRENT_DATE),
        'aberta'
      )
      RETURNING
        conta_pagar_id,
        fornecedor_id,
        descricao,
        valor,
        vencimento,
        data_emissao,
        status,
        criado_em,
        atualizado_em
      `,
      [
        fornecedorId,
        descricao,
        valor,
        vencimento,
        dataEmissao ?? null,
      ]
    );

    const conta = resultado.rows[0];

    return {
      ...conta,
      valor: Number(conta.valor),
    };
  },

  async atualizarStatus(
    contaId: number
  ): Promise<void> {
    await db.query(
      `
      UPDATE mercado_pro.contas_pagar cp
      SET
        status =
          CASE
            WHEN COALESCE(
              (
                SELECT SUM(pc.valor)
                FROM mercado_pro.pagamentos_contas_pagar pc
                WHERE pc.conta_pagar_id = cp.conta_pagar_id
              ),
              0
            ) >= cp.valor
              THEN 'pago'

            WHEN COALESCE(
              (
                SELECT SUM(pc.valor)
                FROM mercado_pro.pagamentos_contas_pagar pc
                WHERE pc.conta_pagar_id = cp.conta_pagar_id
              ),
              0
            ) > 0
              THEN 'parcial'

            WHEN cp.vencimento < CURRENT_DATE
              THEN 'vencida'

            ELSE 'aberta'
          END,

        atualizado_em = CURRENT_TIMESTAMP

      WHERE cp.conta_pagar_id = $1
      `,
      [contaId]
    );
  },

  async registrarPagamento(
    contaId: number,
    usuarioId: number,
    caixaId: number | null,
    formaPagamento: string,
    valor: number,
    observacao?: string
  ): Promise<PagamentoContaPagar> {
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const conta = await client.query(
        `
        SELECT
          conta_pagar_id,
          valor,
          status
        FROM mercado_pro.contas_pagar
        WHERE conta_pagar_id = $1
        FOR UPDATE
        `,
        [contaId]
      );

      if (conta.rows.length === 0) {
        throw new Error(
          "Conta a pagar não encontrada."
        );
      }

      const statusAtual = String(
        conta.rows[0].status
      );

      if (statusAtual === "cancelada") {
        throw new Error(
          "Não é possível pagar uma conta cancelada."
        );
      }

      if (statusAtual === "pago") {
        throw new Error(
          "Esta conta a pagar já está paga."
        );
      }

      const pagamentos = await client.query(
        `
        SELECT
          COALESCE(SUM(valor), 0) AS total_pago
        FROM mercado_pro.pagamentos_contas_pagar
        WHERE conta_pagar_id = $1
        `,
        [contaId]
      );

      const totalPago = Number(
        pagamentos.rows[0].total_pago || 0
      );

      const valorConta = Number(
        conta.rows[0].valor
      );

      const saldoRestante =
        valorConta - totalPago;

      if (valor <= 0) {
        throw new Error(
          "O valor do pagamento deve ser maior que zero."
        );
      }

      if (saldoRestante <= 0) {
        throw new Error(
          "Esta conta não possui saldo restante."
        );
      }

      if (valor > saldoRestante) {
        throw new Error(
          "O valor do pagamento não pode ser maior que o saldo restante da conta."
        );
      }

      const formasPagamento = [
        "dinheiro",
        "pix",
        "credito",
        "debito",
      ];

      if (
        !formasPagamento.includes(
          formaPagamento
        )
      ) {
        throw new Error(
          "Forma de pagamento inválida."
        );
      }

      if (
        formaPagamento === "dinheiro"
      ) {
        if (!caixaId) {
          throw new Error(
            "É necessário informar um caixa aberto para pagamento em dinheiro."
          );
        }

        const caixa = await client.query(
          `
          SELECT
            caixa_id,
            status,
            valor_esperado
          FROM mercado_pro.caixa
          WHERE caixa_id = $1
          FOR UPDATE
          `,
          [caixaId]
        );

        if (caixa.rows.length === 0) {
          throw new Error(
            "Caixa não encontrado."
          );
        }

        if (
          caixa.rows[0].status !==
          "aberto"
        ) {
          throw new Error(
            "O caixa informado está fechado."
          );
        }
      }

      const pagamento =
        await client.query(
          `
          INSERT INTO mercado_pro.pagamentos_contas_pagar (
            conta_pagar_id,
            usuario_id,
            caixa_id,
            forma_pagamento,
            valor,
            observacao
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6
          )
          RETURNING
            pagamento_conta_pagar_id,
            conta_pagar_id,
            usuario_id,
            caixa_id,
            forma_pagamento,
            valor,
            pago_em,
            observacao,
            criado_em
          `,
          [
            contaId,
            usuarioId,
            formaPagamento === "dinheiro"
              ? caixaId
              : null,
            formaPagamento,
            valor,
            observacao ?? null,
          ]
        );

      const novoTotalPago =
        totalPago + valor;

      const novoStatus =
        novoTotalPago >= valorConta
          ? "pago"
          : "parcial";

      await client.query(
        `
        UPDATE mercado_pro.contas_pagar
        SET
          status = $1,
          atualizado_em = CURRENT_TIMESTAMP
        WHERE conta_pagar_id = $2
        `,
        [
          novoStatus,
          contaId,
        ]
      );

      if (
        formaPagamento === "dinheiro"
      ) {
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
          VALUES (
            $1,
            $2,
            'saida',
            $3,
            $4,
            $5
          )
          `,
          [
            caixaId,
            usuarioId,
            `Pagamento conta a pagar #${contaId}`,
            valor,
            formaPagamento,
          ]
        );

        await client.query(
          `
          UPDATE mercado_pro.caixa
          SET
            valor_esperado =
              COALESCE(
                valor_esperado,
                saldo_inicial
              ) - $1
          WHERE caixa_id = $2
            AND status = 'aberto'
          `,
          [
            valor,
            caixaId,
          ]
        );
      }

      await client.query("COMMIT");

      const pagamentoCriado =
        pagamento.rows[0] as PagamentoContaPagar;

      return {
        ...pagamentoCriado,
        valor: Number(
          pagamentoCriado.valor
        ),
      };
    } catch (erro) {
      await client.query("ROLLBACK");
      throw erro;
    } finally {
      client.release();
    }
  },

  async listarPagamentos(
    contaId: number
  ): Promise<PagamentoContaPagar[]> {
    const resultado = await db.query(
      `
      SELECT
        pagamento_conta_pagar_id,
        conta_pagar_id,
        usuario_id,
        caixa_id,
        forma_pagamento,
        valor,
        pago_em,
        observacao,
        criado_em
      FROM mercado_pro.pagamentos_contas_pagar
      WHERE conta_pagar_id = $1
      ORDER BY pago_em DESC
      `,
      [contaId]
    );

    return resultado.rows.map(
      (pagamento: PagamentoContaPagar) => ({
        ...pagamento,
        valor: Number(
          pagamento.valor
        ),
      })
    );
  },

  async cancelar(
    id: number
  ): Promise<ContaPagar | undefined> {
    const resultado = await db.query(
      `
      UPDATE mercado_pro.contas_pagar
      SET
        status = 'cancelada',
        atualizado_em = CURRENT_TIMESTAMP
      WHERE conta_pagar_id = $1
        AND status <> 'pago'
      RETURNING
        conta_pagar_id,
        fornecedor_id,
        descricao,
        valor,
        vencimento,
        data_emissao,
        status,
        criado_em,
        atualizado_em
      `,
      [id]
    );

    if (resultado.rows.length === 0) {
      return undefined;
    }

    const conta =
      resultado.rows[0] as ContaPagar;

    return {
      ...conta,
      valor: Number(
        conta.valor
      ),
    };
  },
};