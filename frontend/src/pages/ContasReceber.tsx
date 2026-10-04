import React, { useEffect, useState } from "react";
import axios from "axios";
import Tabela, { ColunaTabela } from "../components/Tabela";
import Botao from "../components/Botao";
import api from "../services/api";

interface ContaReceber {
  contaReceberId: number;
  clienteId: number | null;
  clienteNome: string;
  vendaId: number | null;
  descricao: string;
  valor: number;
  vencimento: string;
  recebida: boolean;
  recebidaEm: string | null;
}

interface ContaReceberApi {
  contaReceberId?: number;
  id?: number;
  clienteId?: number | null;
  clienteNome?: string | null;
  vendaId?: number | null;
  descricao?: string | null;
  valor?: number | string | null;
  vencimento?: string | null;
  recebida?: boolean;
  recebidaEm?: string | null;
}

interface RespostaErroApi {
  erro?: string;
  message?: string;
}

interface CriarContaPayload {
  clienteId: number;
  vendaId?: number;
  descricao: string;
  valor: number;
  vencimento: string;
}

interface ReceberContaPayload {
  valor: number;
  formaPagamento: string;
  observacao?: string;
}

type FormaPagamento =
  | "dinheiro"
  | "pix"
  | "credito"
  | "debito";

const ContasReceber: React.FC = () => {
  const [contas, setContas] = useState<ContaReceber[]>([]);
  const [carregando, setCarregando] = useState(false);

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [clienteId, setClienteId] = useState("");
  const [vendaId, setVendaId] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [vencimento, setVencimento] = useState("");

  const [contaSelecionada, setContaSelecionada] =
    useState<ContaReceber | null>(null);

  const [valorRecebimento, setValorRecebimento] =
    useState("");

  const [formaPagamento, setFormaPagamento] =
    useState<FormaPagamento>("dinheiro");

  const [observacao, setObservacao] = useState("");

  function obterMensagemErro(
    erro: unknown,
    mensagemPadrao: string
  ): string {
    if (!axios.isAxiosError<RespostaErroApi>(erro)) {
      return mensagemPadrao;
    }

    return (
      erro.response?.data?.erro ??
      erro.response?.data?.message ??
      mensagemPadrao
    );
  }

  function normalizarConta(
    conta: ContaReceberApi
  ): ContaReceber | null {
    const id = Number(
      conta.contaReceberId ?? conta.id
    );

    if (!Number.isInteger(id) || id <= 0) {
      return null;
    }

    return {
      contaReceberId: id,

      clienteId:
        conta.clienteId != null
          ? Number(conta.clienteId)
          : null,

      clienteNome:
        conta.clienteNome?.trim() ||
        "Cliente não informado",

      vendaId:
        conta.vendaId != null
          ? Number(conta.vendaId)
          : null,

      descricao:
        conta.descricao?.trim() || "",

      valor: Number(conta.valor ?? 0),

      vencimento:
        conta.vencimento ?? "",

      recebida:
        Boolean(conta.recebida),

      recebidaEm:
        conta.recebidaEm ?? null,
    };
  }

  async function carregar(): Promise<void> {
    try {
      setCarregando(true);

      const resposta =
        await api.get<ContaReceberApi[]>(
          "/contas-receber"
        );

      const lista = Array.isArray(resposta.data)
        ? resposta.data
        : [];

      const contasNormalizadas = lista
        .map(normalizarConta)
        .filter(
          (
            conta
          ): conta is ContaReceber =>
            conta !== null
        );

      setContas(contasNormalizadas);
    } catch (erro: unknown) {
      console.error(
        "Erro ao carregar contas a receber:",
        erro
      );

      setContas([]);

      alert(
        obterMensagemErro(
          erro,
          "Não foi possível carregar as contas a receber."
        )
      );
    } finally {
      setCarregando(false);
    }
  }

useEffect(() => {
  async function iniciar(): Promise<void> {
    await carregar();
  }

  void iniciar();
}, []);
  function limparFormulario(): void {
    setClienteId("");
    setVendaId("");
    setDescricao("");
    setValor("");
    setVencimento("");
  }

  async function criarConta(): Promise<void> {
    const cliente = Number(clienteId);
    const venda = vendaId
      ? Number(vendaId)
      : undefined;

    const valorNumerico = Number(valor);

    if (
      !Number.isInteger(cliente) ||
      cliente <= 0
    ) {
      alert("Informe um ID de cliente válido.");
      return;
    }

    if (!descricao.trim()) {
      alert("Informe a descrição.");
      return;
    }

    if (
      !Number.isFinite(valorNumerico) ||
      valorNumerico <= 0
    ) {
      alert("Informe um valor válido.");
      return;
    }

    if (!vencimento) {
      alert("Informe o vencimento.");
      return;
    }

    if (
      venda !== undefined &&
      (!Number.isInteger(venda) || venda <= 0)
    ) {
      alert("Informe um ID de venda válido.");
      return;
    }

    const dados: CriarContaPayload = {
      clienteId: cliente,
      descricao: descricao.trim(),
      valor: valorNumerico,
      vencimento,
    };

    if (venda !== undefined) {
      dados.vendaId = venda;
    }

    try {
      await api.post(
        "/contas-receber",
        dados
      );

      alert(
        "Conta a receber cadastrada com sucesso."
      );

      limparFormulario();
      setMostrarFormulario(false);

      await carregar();
    } catch (erro: unknown) {
      console.error(
        "Erro ao criar conta a receber:",
        erro
      );

      alert(
        obterMensagemErro(
          erro,
          "Não foi possível cadastrar a conta."
        )
      );
    }
  }

  function abrirRecebimento(
    conta: ContaReceber
  ): void {
    if (conta.recebida) {
      return;
    }

    setContaSelecionada(conta);

    setValorRecebimento(
      conta.valor.toFixed(2)
    );

    setFormaPagamento("dinheiro");
    setObservacao("");
  }

  function fecharRecebimento(): void {
    setContaSelecionada(null);
    setValorRecebimento("");
    setFormaPagamento("dinheiro");
    setObservacao("");
  }

  async function receberConta(): Promise<void> {
    if (!contaSelecionada) {
      return;
    }

    const valorRecebido =
      Number(valorRecebimento);

    if (
      !Number.isFinite(valorRecebido) ||
      valorRecebido <= 0
    ) {
      alert("Informe um valor válido.");
      return;
    }

    if (
      valorRecebido >
      contaSelecionada.valor
    ) {
      alert(
        "O valor recebido não pode ser maior que o valor da conta."
      );
      return;
    }

    if (
      valorRecebido <
      contaSelecionada.valor
    ) {
      alert(
        "O recebimento parcial ainda não está disponível. Informe o valor total da conta."
      );
      return;
    }

    const dados: ReceberContaPayload = {
      valor: valorRecebido,
      formaPagamento,
    };

    const observacaoLimpa =
      observacao.trim();

    if (observacaoLimpa) {
      dados.observacao =
        observacaoLimpa;
    }

    try {
      await api.put(
        `/contas-receber/${contaSelecionada.contaReceberId}/receber`,
        dados
      );

      alert(
        "Recebimento registrado com sucesso."
      );

      fecharRecebimento();

      await carregar();
    } catch (erro: unknown) {
      console.error(
        "Erro ao registrar recebimento:",
        erro
      );

      alert(
        obterMensagemErro(
          erro,
          "Não foi possível registrar o recebimento."
        )
      );
    }
  }

  function obterStatus(
    conta: ContaReceber
  ): string {
    if (conta.recebida) {
      return "Paga";
    }

    if (!conta.vencimento) {
      return "Aberta";
    }

    const hoje = new Date();

    hoje.setHours(
      0,
      0,
      0,
      0
    );

    const vencimento = new Date(
      `${conta.vencimento}T00:00:00`
    );

    if (vencimento < hoje) {
      return "Vencida";
    }

    return "Aberta";
  }

  function formatarData(
    data: string
  ): string {
    if (!data) {
      return "-";
    }

    const dataFormatada = new Date(
      `${data}T00:00:00`
    );

    if (
      Number.isNaN(
        dataFormatada.getTime()
      )
    ) {
      return "-";
    }

    return dataFormatada.toLocaleDateString(
      "pt-BR"
    );
  }

  const colunas: ColunaTabela<ContaReceber>[] =
    [
      {
        chave: "clienteNome",
        titulo: "Cliente",
        render: (valor) =>
          String(valor || "Não informado"),
      },

      {
        chave: "vendaId",
        titulo: "Venda",
        render: (valor) =>
          valor
            ? `#${valor}`
            : "-",
      },

      {
        chave: "descricao",
        titulo: "Descrição",
      },

      {
        chave: "valor",
        titulo: "Valor",
        render: (valor) =>
          `R$ ${Number(valor).toFixed(2)}`,
      },

      {
        chave: "vencimento",
        titulo: "Vencimento",
        render: (valor) =>
          formatarData(String(valor)),
      },

      {
        chave: "recebida",
        titulo: "Situação",
        render: (_valor, linha) =>
          obterStatus(linha),
      },

      {
        chave: "contaReceberId",
        titulo: "Ações",
        render: (_valor, linha) =>
          linha.recebida ? (
            "Recebida"
          ) : (
            <Botao
              texto="Receber"
              variante="secundario"
              onClick={() =>
                abrirRecebimento(
                  linha
                )
              }
            />
          ),
      },
    ];

  return (
    <main style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2>Contas a Receber</h2>

        <Botao
          texto="Nova Conta"
          variante="primario"
          onClick={() =>
            setMostrarFormulario(
              !mostrarFormulario
            )
          }
        />
      </div>

      {mostrarFormulario && (
        <section
          style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 20,
            marginBottom: 24,
          }}
        >
          <h3>
            Nova Conta a Receber
          </h3>

          <div
            style={{
              display: "grid",
              gap: 12,
              maxWidth: 500,
            }}
          >
            <input
              type="number"
              placeholder="ID do cliente"
              value={clienteId}
              onChange={(e) =>
                setClienteId(
                  e.target.value
                )
              }
            />

            <input
              type="number"
              placeholder="ID da venda (opcional)"
              value={vendaId}
              onChange={(e) =>
                setVendaId(
                  e.target.value
                )
              }
            />

            <input
              type="text"
              placeholder="Descrição"
              value={descricao}
              onChange={(e) =>
                setDescricao(
                  e.target.value
                )
              }
            />

            <input
              type="number"
              step="0.01"
              placeholder="Valor"
              value={valor}
              onChange={(e) =>
                setValor(
                  e.target.value
                )
              }
            />

            <input
              type="date"
              value={vencimento}
              onChange={(e) =>
                setVencimento(
                  e.target.value
                )
              }
            />

            <div
              style={{
                display: "flex",
                gap: 10,
              }}
            >
              <Botao
                texto="Salvar"
                variante="primario"
                onClick={
                  criarConta
                }
              />

              <Botao
                texto="Cancelar"
                variante="secundario"
                onClick={() => {
                  limparFormulario();
                  setMostrarFormulario(
                    false
                  );
                }}
              />
            </div>
          </div>
        </section>
      )}

      {carregando ? (
        <p>
          Carregando contas...
        </p>
      ) : contas.length === 0 ? (
        <p>
          Nenhuma conta a receber
          encontrada.
        </p>
      ) : (
        <Tabela
          colunas={colunas}
          dados={contas}
          chaveLinha={(conta) =>
            String(
              conta.contaReceberId
            )
          }
        />
      )}

      {contaSelecionada && (
        <section
          style={{
            marginTop: 24,
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 20,
            maxWidth: 500,
          }}
        >
          <h3>
            Registrar Recebimento
          </h3>

          <p>
            <strong>
              {contaSelecionada.clienteNome}
            </strong>
          </p>

          <p>
            Venda:{" "}
            <strong>
              {contaSelecionada.vendaId
                ? `#${contaSelecionada.vendaId}`
                : "Não vinculada"}
            </strong>
          </p>

          <p>
            Valor da conta:{" "}
            <strong>
              R${" "}
              {contaSelecionada.valor.toFixed(
                2
              )}
            </strong>
          </p>

          <div
            style={{
              display: "grid",
              gap: 12,
            }}
          >
            <input
              type="number"
              step="0.01"
              placeholder="Valor recebido"
              value={
                valorRecebimento
              }
              onChange={(e) =>
                setValorRecebimento(
                  e.target.value
                )
              }
            />

            <select
              value={
                formaPagamento
              }
              onChange={(e) =>
                setFormaPagamento(
                  e.target
                    .value as FormaPagamento
                )
              }
            >
              <option value="dinheiro">
                Dinheiro
              </option>

              <option value="pix">
                PIX
              </option>

              <option value="credito">
                Cartão de Crédito
              </option>

              <option value="debito">
                Cartão de Débito
              </option>
            </select>

            <input
              type="text"
              placeholder="Observação (opcional)"
              value={observacao}
              onChange={(e) =>
                setObservacao(
                  e.target.value
                )
              }
            />

            <div
              style={{
                display: "flex",
                gap: 10,
              }}
            >
              <Botao
                texto="Confirmar Recebimento"
                variante="primario"
                onClick={
                  receberConta
                }
              />

              <Botao
                texto="Cancelar"
                variante="secundario"
                onClick={
                  fecharRecebimento
                }
              />
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default ContasReceber;