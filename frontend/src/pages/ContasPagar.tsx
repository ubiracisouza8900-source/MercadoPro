import React, { useEffect, useState } from "react";

import Tabela, {
  ColunaTabela,
} from "../components/Tabela";

import Botao from "../components/Botao";

import api from "../services/api";

import { ContaPagar } from "../types/ContaPagar";

interface Caixa {
  caixaId?: number;
  status: string;
}

interface Fornecedor {
  fornecedor_id: number;
  nome: string;
}

interface ErroApi {
  response?: {
    data?: {
      erro?: string;
      mensagem?: string;
    };
  };
}

type FormaPagamento =
  | "dinheiro"
  | "pix"
  | "credito"
  | "debito";

type StatusContaPagar =
  | "aberta"
  | "vencida"
  | "parcial"
  | "pago"
  | "cancelada";

const ContasPagar: React.FC = () => {
  const [contas, setContas] =
    useState<ContaPagar[]>([]);

  const [fornecedores, setFornecedores] =
    useState<Fornecedor[]>([]);

  const [caixa, setCaixa] =
    useState<Caixa | null>(null);

  const [carregando, setCarregando] =
    useState(true);

  const [modalAberto, setModalAberto] =
    useState(false);

  const [
    modalPagamentoAberto,
    setModalPagamentoAberto,
  ] = useState(false);

  const [salvando, setSalvando] =
    useState(false);

  const [pagando, setPagando] =
    useState(false);

  const [contaSelecionada, setContaSelecionada] =
    useState<ContaPagar | null>(null);

  const [fornecedorId, setFornecedorId] =
    useState("");

  const [descricao, setDescricao] =
    useState("");

  const [valor, setValor] =
    useState("");

  const [dataEmissao, setDataEmissao] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [vencimento, setVencimento] =
    useState("");

  const [valorPagamento, setValorPagamento] =
    useState("");

  const [formaPagamento, setFormaPagamento] =
    useState<FormaPagamento>("dinheiro");

  const [observacao, setObservacao] =
    useState("");

  function obterMensagemErro(
    erro: unknown,
    mensagemPadrao: string
  ): string {
    if (
      typeof erro === "object" &&
      erro !== null &&
      "response" in erro
    ) {
      const erroApi = erro as ErroApi;

      return (
        erroApi.response?.data?.erro ||
        erroApi.response?.data?.mensagem ||
        mensagemPadrao
      );
    }

    return mensagemPadrao;
  }

  async function carregar() {
    try {
      setCarregando(true);

      const [
        respostaContas,
        respostaFornecedores,
        respostaCaixa,
      ] = await Promise.all([
        api.get("/contas-pagar"),
        api.get("/fornecedores"),
        api.get("/caixa/atual"),
      ]);

      setContas(respostaContas.data);
      setFornecedores(
        respostaFornecedores.data
      );
      setCaixa(respostaCaixa.data);
    } catch (erro: unknown) {
      console.error(
        "Erro ao carregar dados das contas a pagar:",
        erro
      );

      window.alert(
        obterMensagemErro(
          erro,
          "Não foi possível carregar os dados."
        )
      );

      setContas([]);
      setFornecedores([]);
      setCaixa(null);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregar();
  }, []);

  function abrirModal() {
    setFornecedorId("");
    setDescricao("");
    setValor("");

    setDataEmissao(
      new Date()
        .toISOString()
        .split("T")[0]
    );

    setVencimento("");
    setModalAberto(true);
  }

  function fecharModal() {
    if (salvando) {
      return;
    }

    setModalAberto(false);
  }

  async function salvarConta() {
    if (!descricao.trim()) {
      window.alert(
        "A descrição é obrigatória."
      );
      return;
    }

    const valorNumerico = Number(
      valor.replace(",", ".")
    );

    if (
      !Number.isFinite(valorNumerico) ||
      valorNumerico <= 0
    ) {
      window.alert(
        "Informe um valor maior que zero."
      );
      return;
    }

    if (!vencimento) {
      window.alert(
        "O vencimento é obrigatório."
      );
      return;
    }

    try {
      setSalvando(true);

      await api.post("/contas-pagar", {
        fornecedorId: fornecedorId
          ? Number(fornecedorId)
          : null,
        descricao: descricao.trim(),
        valor: valorNumerico,
        dataEmissao,
        vencimento,
      });

      setModalAberto(false);

      await carregar();

      window.alert(
        "Conta a pagar cadastrada com sucesso."
      );
    } catch (erro: unknown) {
      console.error(
        "Erro ao cadastrar conta:",
        erro
      );

      window.alert(
        obterMensagemErro(
          erro,
          "Não foi possível cadastrar a conta."
        )
      );
    } finally {
      setSalvando(false);
    }
  }

  function formatarValor(valor: number) {
    return Number(valor).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );
  }

  function formatarData(data: string) {
    if (!data) {
      return "-";
    }

    return new Date(
      `${data}T00:00:00`
    ).toLocaleDateString("pt-BR");
  }

  function obterStatus(
    status: ContaPagar["status"]
  ): StatusContaPagar {
    return String(
      status
    ) as StatusContaPagar;
  }

  function situacao(
    status: ContaPagar["status"]
  ) {
    const statusAtual =
      obterStatus(status);

    switch (statusAtual) {
      case "aberta":
        return "Aberta";

      case "vencida":
        return "Vencida";

      case "parcial":
        return "Pagamento parcial";

      case "pago":
        return "Pago";

      case "cancelada":
        return "Cancelada";

      default:
        return String(status);
    }
  }

  function podePagar(
    status: ContaPagar["status"]
  ) {
    const statusAtual =
      obterStatus(status);

    return (
      statusAtual === "aberta" ||
      statusAtual === "vencida" ||
      statusAtual === "parcial"
    );
  }

  function abrirModalPagamento(
    conta: ContaPagar
  ) {
    const saldo = Number(
      conta.saldo_restante ?? 0
    );

    if (saldo <= 0) {
      window.alert(
        "Esta conta não possui saldo restante."
      );
      return;
    }

    setContaSelecionada(conta);

    setValorPagamento(
      saldo.toFixed(2)
    );

    setFormaPagamento("dinheiro");
    setObservacao("");
    setModalPagamentoAberto(true);
  }

  function fecharModalPagamento() {
    if (pagando) {
      return;
    }

    setModalPagamentoAberto(false);
    setContaSelecionada(null);
    setValorPagamento("");
    setObservacao("");
    setFormaPagamento("dinheiro");
  }

  async function confirmarPagamento() {
    if (!contaSelecionada) {
      return;
    }

    const valorPagamentoNumerico =
      Number(
        valorPagamento.replace(",", ".")
      );

    const saldoRestante = Number(
      contaSelecionada.saldo_restante ?? 0
    );

    if (
      !Number.isFinite(
        valorPagamentoNumerico
      ) ||
      valorPagamentoNumerico <= 0
    ) {
      window.alert(
        "Informe um valor válido."
      );
      return;
    }

    if (
      valorPagamentoNumerico >
      saldoRestante
    ) {
      window.alert(
        `O valor informado é maior que o saldo restante de ${formatarValor(
          saldoRestante
        )}.`
      );
      return;
    }

    let caixaId: number | null = null;

    if (
      formaPagamento === "dinheiro"
    ) {
      if (!caixa) {
        window.alert(
          "Não foi possível localizar o caixa."
        );
        return;
      }

      if (caixa.status !== "aberto") {
        window.alert(
          "O caixa está fechado. Abra o caixa para realizar um pagamento em dinheiro."
        );
        return;
      }

      if (!caixa.caixaId) {
        window.alert(
          "O caixa aberto não possui um identificador válido."
        );
        return;
      }

      caixaId = caixa.caixaId;
    }

    try {
      setPagando(true);

      await api.post(
        `/contas-pagar/${contaSelecionada.conta_pagar_id}/pagamentos`,
        {
          valor: valorPagamentoNumerico,
          formaPagamento,
          caixaId,
          observacao:
            observacao.trim() || null,
        }
      );

      setModalPagamentoAberto(false);
      setContaSelecionada(null);
      setValorPagamento("");
      setObservacao("");
      setFormaPagamento("dinheiro");

      await carregar();

      window.alert(
        "Pagamento registrado com sucesso."
      );
    } catch (erro: unknown) {
      console.error(
        "Erro ao registrar pagamento:",
        erro
      );

      window.alert(
        obterMensagemErro(
          erro,
          "Não foi possível registrar o pagamento."
        )
      );
    } finally {
      setPagando(false);
    }
  }

  async function cancelarConta(
    conta: ContaPagar
  ) {
    const statusAtual =
      obterStatus(conta.status);

    if (
      statusAtual === "pago" ||
      statusAtual === "cancelada"
    ) {
      return;
    }

    const confirmar =
      window.confirm(
        `Deseja realmente cancelar a conta "${conta.descricao}"?`
      );

    if (!confirmar) {
      return;
    }

    try {
      await api.put(
        `/contas-pagar/${conta.conta_pagar_id}/cancelar`
      );

      await carregar();

      window.alert(
        "Conta cancelada com sucesso."
      );
    } catch (erro: unknown) {
      console.error(
        "Erro ao cancelar conta:",
        erro
      );

      window.alert(
        obterMensagemErro(
          erro,
          "Não foi possível cancelar a conta."
        )
      );
    }
  }

  const colunas: ColunaTabela<ContaPagar>[] =
    [
      {
        chave: "descricao",
        titulo: "Descrição",
      },

      {
        chave: "valor",
        titulo: "Valor",
        render: (valor) =>
          formatarValor(Number(valor)),
      },

      {
        chave: "vencimento",
        titulo: "Vencimento",
        render: (valor) =>
          formatarData(String(valor)),
      },

      {
        chave: "total_pago",
        titulo: "Pago",
        render: (valor) =>
          formatarValor(Number(valor)),
      },

      {
        chave: "saldo_restante",
        titulo: "Saldo",
        render: (valor) =>
          formatarValor(Number(valor)),
      },

      {
        chave: "status",
        titulo: "Situação",
        render: (valor) =>
          situacao(
            String(
              valor
            ) as ContaPagar["status"]
          ),
      },

      {
        chave: "conta_pagar_id",
        titulo: "Ações",

        render: (_valor, conta) => (
          <div
            style={{
              display: "flex",
              gap: 8,
            }}
          >
            {podePagar(
              conta.status
            ) && (
              <Botao
                texto="Pagar"
                variante="secundario"
                onClick={() =>
                  abrirModalPagamento(
                    conta
                  )
                }
              />
            )}

            {obterStatus(
              conta.status
            ) !== "cancelada" &&
              obterStatus(
                conta.status
              ) !== "pago" && (
                <Botao
                  texto="Cancelar"
                  variante="secundario"
                  onClick={() =>
                    cancelarConta(
                      conta
                    )
                  }
                />
              )}
          </div>
        ),
      },
    ];

  return (
    <main
      style={{
        padding: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2>Contas a Pagar</h2>

        <Botao
          texto="+ Nova Conta"
          variante="primario"
          onClick={abrirModal}
        />
      </div>

      {carregando && (
        <p>
          Carregando contas...
        </p>
      )}

      {!carregando &&
        contas.length === 0 && (
          <p>
            Nenhuma conta a pagar
            cadastrada.
          </p>
        )}

      <Tabela
        colunas={colunas}
        dados={contas}
        chaveLinha={(conta) =>
          String(
            conta.conta_pagar_id
          )
        }
      />

      {modalAberto && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              width: "100%",
              maxWidth: 500,
              padding: 24,
              borderRadius: 8,
              boxShadow:
                "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <h3>
              Nova Conta a Pagar
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection:
                  "column",
                gap: 14,
                marginTop: 20,
              }}
            >
              <label>
                Fornecedor

                <select
                  value={fornecedorId}
                  onChange={(e) =>
                    setFornecedorId(
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    padding: 10,
                    marginTop: 5,
                  }}
                >
                  <option value="">
                    Selecione um fornecedor
                  </option>

                  {fornecedores.map(
                    (fornecedor) => (
                      <option
                        key={
                          fornecedor.fornecedor_id
                        }
                        value={
                          fornecedor.fornecedor_id
                        }
                      >
                        {fornecedor.nome}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                Descrição *

                <input
                  type="text"
                  value={descricao}
                  onChange={(e) =>
                    setDescricao(
                      e.target.value
                    )
                  }
                  placeholder="Ex.: Compra de mercadorias"
                  style={{
                    width: "100%",
                    padding: 10,
                    marginTop: 5,
                  }}
                />
              </label>

              <label>
                Valor *

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={valor}
                  onChange={(e) =>
                    setValor(
                      e.target.value
                    )
                  }
                  placeholder="0,00"
                  style={{
                    width: "100%",
                    padding: 10,
                    marginTop: 5,
                  }}
                />
              </label>

              <label>
                Data de emissão

                <input
                  type="date"
                  value={dataEmissao}
                  onChange={(e) =>
                    setDataEmissao(
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    padding: 10,
                    marginTop: 5,
                  }}
                />
              </label>

              <label>
                Vencimento *

                <input
                  type="date"
                  value={vencimento}
                  onChange={(e) =>
                    setVencimento(
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    padding: 10,
                    marginTop: 5,
                  }}
                />
              </label>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "flex-end",
                  gap: 10,
                  marginTop: 10,
                }}
              >
                <Botao
                  texto="Cancelar"
                  variante="secundario"
                  onClick={
                    fecharModal
                  }
                />

                <Botao
                  texto={
                    salvando
                      ? "Salvando..."
                      : "Salvar"
                  }
                  variante="primario"
                  onClick={
                    salvarConta
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {modalPagamentoAberto &&
        contaSelecionada && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background:
                "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1100,
            }}
          >
            <div
              style={{
                background: "#fff",
                width: "100%",
                maxWidth: 450,
                padding: 24,
                borderRadius: 8,
                boxShadow:
                  "0 10px 30px rgba(0,0,0,0.2)",
              }}
            >
              <h3>
                Registrar Pagamento
              </h3>

              <p
                style={{
                  marginTop: 10,
                  marginBottom: 20,
                }}
              >
                <strong>
                  {
                    contaSelecionada.descricao
                  }
                </strong>
              </p>

              <div
                style={{
                  background: "#f5f5f5",
                  padding: 12,
                  borderRadius: 6,
                  marginBottom: 18,
                }}
              >
                <div>
                  Valor da conta:{" "}
                  <strong>
                    {formatarValor(
                      Number(
                        contaSelecionada.valor
                      )
                    )}
                  </strong>
                </div>

                <div>
                  Já pago:{" "}
                  <strong>
                    {formatarValor(
                      Number(
                        contaSelecionada.total_pago ??
                          0
                      )
                    )}
                  </strong>
                </div>

                <div>
                  Saldo restante:{" "}
                  <strong>
                    {formatarValor(
                      Number(
                        contaSelecionada.saldo_restante ??
                          0
                      )
                    )}
                  </strong>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection:
                    "column",
                  gap: 14,
                }}
              >
                <label>
                  Valor do pagamento *

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    max={Number(
                      contaSelecionada.saldo_restante ??
                        0
                    )}
                    value={
                      valorPagamento
                    }
                    onChange={(e) =>
                      setValorPagamento(
                        e.target.value
                      )
                    }
                    style={{
                      width: "100%",
                      padding: 10,
                      marginTop: 5,
                    }}
                  />
                </label>

                <label>
                  Forma de pagamento *

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
                    style={{
                      width: "100%",
                      padding: 10,
                      marginTop: 5,
                    }}
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
                </label>

                <label>
                  Observação

                  <input
                    type="text"
                    value={observacao}
                    onChange={(e) =>
                      setObservacao(
                        e.target.value
                      )
                    }
                    placeholder="Opcional"
                    style={{
                      width: "100%",
                      padding: 10,
                      marginTop: 5,
                    }}
                  />
                </label>

                {formaPagamento ===
                  "dinheiro" && (
                  <div
                    style={{
                      padding: 10,
                      borderRadius: 6,
                      background:
                        caixa?.status ===
                        "aberto"
                          ? "#e8f5e9"
                          : "#ffebee",
                    }}
                  >
                    Caixa:{" "}
                    <strong>
                      {caixa?.status ===
                      "aberto"
                        ? "Aberto"
                        : "Fechado"}
                    </strong>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "flex-end",
                    gap: 10,
                    marginTop: 10,
                  }}
                >
                  <Botao
                    texto="Cancelar"
                    variante="secundario"
                    onClick={
                      fecharModalPagamento
                    }
                  />

                  <Botao
                    texto={
                      pagando
                        ? "Registrando..."
                        : "Confirmar Pagamento"
                    }
                    variante="primario"
                    onClick={
                      confirmarPagamento
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}
    </main>
  );
};

export default ContasPagar;