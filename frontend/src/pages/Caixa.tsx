import React, { useEffect, useState } from "react";
import Botao from "../components/Botao";
import api from "../services/api";

interface Caixa {
  caixaId?: number;
  status: "aberto" | "fechado";
  saldoInicial: number;
  valorEsperado: number;
  valorInformado: number;
  diferenca: number;
  abertoEm?: string;
  fechadoEm?: string;
}

interface Venda {
  id: number;
  clienteId?: number | null;
  usuarioId: number;
  caixaId?: number | null;
  total: number;
  formaPagamento: string;
  dataVenda: string;
}

interface FechamentoImpressao {
  caixaId?: number;
  abertoEm?: string;
  fechadoEm: string;
  saldoInicial: number;
  totalDinheiro: number;
  totalPix: number;
  totalCredito: number;
  totalDebito: number;
  totalFiado: number;
  totalVendas: number;
  valorEsperado: number;
  valorInformado: number;
  diferenca: number;
}

const Caixa: React.FC = () => {
  const [caixa, setCaixa] = useState<Caixa | null>(null);

  const [vendas, setVendas] = useState<Venda[]>([]);

  const [saldoInicial, setSaldoInicial] = useState("");
  const [valorInformado, setValorInformado] = useState("");

  const [carregando, setCarregando] = useState(false);

  const [mostrarConferencia, setMostrarConferencia] =
    useState(false);

  const [diferencaConferencia, setDiferencaConferencia] =
    useState(0);

  const [fechamentoParaImprimir, setFechamentoParaImprimir] =
    useState<FechamentoImpressao | null>(null);

  async function carregarCaixa() {
    try {
      const resposta = await api.get("/caixa/atual");

      setCaixa({
        caixaId: resposta.data.caixaId,
        status: resposta.data.status,
        saldoInicial: Number(
          resposta.data.saldoInicial || 0
        ),
        valorEsperado: Number(
          resposta.data.valorEsperado || 0
        ),
        valorInformado: Number(
          resposta.data.valorInformado || 0
        ),
        diferenca: Number(
          resposta.data.diferenca || 0
        ),
        abertoEm: resposta.data.abertoEm,
        fechadoEm: resposta.data.fechadoEm,
      });
    } catch (erro) {
      console.error(
        "Erro ao carregar caixa:",
        erro
      );
    }
  }

  async function carregarVendas() {
    try {
      const resposta = await api.get("/vendas");

      setVendas(resposta.data);
    } catch (erro) {
      console.error(
        "Erro ao carregar vendas:",
        erro
      );
    }
  }

  async function carregarDados() {
    await Promise.all([
      carregarCaixa(),
      carregarVendas(),
    ]);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      carregarCaixa();
      carregarVendas();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  async function abrirCaixa() {
    try {
      setCarregando(true);

      await api.post("/caixa/abrir", {
        saldoInicial: Number(
          saldoInicial || 0
        ),
      });

      setSaldoInicial("");

      await carregarDados();
    } catch (erro) {
      console.error(
        "Erro ao abrir caixa:",
        erro
      );

      alert(
        "Não foi possível abrir o caixa."
      );
    } finally {
      setCarregando(false);
    }
  }

  function iniciarFechamento() {
    if (!caixa) {
      return;
    }

    if (valorInformado === "") {
      alert(
        "Informe o valor contado no caixa."
      );

      return;
    }

    const valorContado =
      Number(valorInformado);

    if (valorContado < 0) {
      alert(
        "O valor contado não pode ser negativo."
      );

      return;
    }

    const diferenca =
      valorContado -
      Number(caixa.valorEsperado || 0);

    setDiferencaConferencia(diferenca);

    setMostrarConferencia(true);
  }

  async function confirmarFechamento() {
    if (!caixa) {
      return;
    }

    const valorContado =
      Number(valorInformado);

    const diferenca =
      valorContado -
      Number(caixa.valorEsperado || 0);

    const fechamento: FechamentoImpressao = {
      caixaId: caixa.caixaId,
      abertoEm: caixa.abertoEm,
      fechadoEm: new Date().toISOString(),
      saldoInicial: caixa.saldoInicial,
      totalDinheiro,
      totalPix,
      totalCredito,
      totalDebito,
      totalFiado,
      totalVendas,
      valorEsperado: caixa.valorEsperado,
      valorInformado: valorContado,
      diferenca,
    };

    try {
      setCarregando(true);

      await api.post("/caixa/fechar", {
        valorEsperado:
          caixa.valorEsperado,

        valorInformado:
          valorContado,
      });

      setFechamentoParaImprimir(
        fechamento
      );

      setMostrarConferencia(false);
      setValorInformado("");

      await carregarDados();
    } catch (erro) {
      console.error(
        "Erro ao fechar caixa:",
        erro
      );

      alert(
        "Não foi possível fechar o caixa."
      );
    } finally {
      setCarregando(false);
    }
  }

  function cancelarFechamento() {
    setMostrarConferencia(false);
  }

  function imprimirFechamento() {
    window.print();
  }

  function dinheiro(valor: number) {
    return valor
      .toFixed(2)
      .replace(".", ",");
  }

  function nomeFormaPagamento(
    forma: string
  ) {
    switch (forma) {
      case "dinheiro":
        return "Dinheiro";

      case "pix":
        return "PIX";

      case "credito":
        return "Crédito";

      case "debito":
        return "Débito";

      case "fiado":
        return "Fiado";

      default:
        return forma;
    }
  }

  const caixaAberto =
    caixa?.status === "aberto";

  const vendasDoCaixa = vendas.filter(
    (venda) =>
      caixa?.caixaId &&
      venda.caixaId === caixa.caixaId
  );

  const totalDinheiro =
    vendasDoCaixa
      .filter(
        (venda) =>
          venda.formaPagamento ===
          "dinheiro"
      )
      .reduce(
        (total, venda) =>
          total + Number(venda.total || 0),
        0
      );

  const totalPix =
    vendasDoCaixa
      .filter(
        (venda) =>
          venda.formaPagamento === "pix"
      )
      .reduce(
        (total, venda) =>
          total + Number(venda.total || 0),
        0
      );

  const totalCredito =
    vendasDoCaixa
      .filter(
        (venda) =>
          venda.formaPagamento ===
          "credito"
      )
      .reduce(
        (total, venda) =>
          total + Number(venda.total || 0),
        0
      );

  const totalDebito =
    vendasDoCaixa
      .filter(
        (venda) =>
          venda.formaPagamento ===
          "debito"
      )
      .reduce(
        (total, venda) =>
          total + Number(venda.total || 0),
        0
      );

  const totalFiado =
    vendasDoCaixa
      .filter(
        (venda) =>
          venda.formaPagamento ===
          "fiado"
      )
      .reduce(
        (total, venda) =>
          total + Number(venda.total || 0),
        0
      );

  const totalVendas =
    totalDinheiro +
    totalPix +
    totalCredito +
    totalDebito +
    totalFiado;

  return (
    <main
      style={{
        padding: 24,
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      <style>
        {`
          @media print {
            body {
              margin: 0;
              background: #fff;
            }

            body * {
              visibility: hidden;
            }

            .area-impressao,
            .area-impressao * {
              visibility: visible;
            }

            .area-impressao {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 30px;
              box-sizing: border-box;
            }

            .nao-imprimir {
              display: none !important;
            }
          }
        `}
      </style>

      <div className="nao-imprimir">
        <h1>Caixa</h1>

        <p>
          Caixa do dia •{" "}
          <strong>
            {caixaAberto
              ? "ABERTO"
              : "FECHADO"}
          </strong>
        </p>

        {fechamentoParaImprimir && (
          <section
            style={{
              marginTop: 20,
              padding: 20,
              border: "1px solid #ddd",
              borderRadius: 10,
            }}
          >
            <h2>
              ✅ Caixa fechado
            </h2>

            <p>
              O fechamento foi realizado
              com sucesso.
            </p>

            <Botao
              texto="🖨️ Imprimir Fechamento"
              variante="sucesso"
              onClick={imprimirFechamento}
            />
          </section>
        )}

        {!caixaAberto ? (
          <section
            style={{
              marginTop: 30,
              padding: 24,
              border: "1px solid #ddd",
              borderRadius: 10,
              maxWidth: 500,
            }}
          >
            <h2>Abrir Caixa</h2>

            <p>
              Informe o dinheiro disponível
              no início do dia.
            </p>

            <label>
              Saldo inicial
            </label>

            <input
              type="number"
              step="0.01"
              min="0"
              value={saldoInicial}
              onChange={(e) =>
                setSaldoInicial(
                  e.target.value
                )
              }
              placeholder="0,00"
              style={{
                display: "block",
                width: "100%",
                padding: 12,
                marginTop: 8,
                marginBottom: 20,
                boxSizing: "border-box",
              }}
            />

            <Botao
              texto={
                carregando
                  ? "Abrindo..."
                  : "Abrir Caixa"
              }
              variante="sucesso"
              onClick={abrirCaixa}
            />
          </section>
        ) : (
          <>
            <section
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(5, 1fr)",
                gap: 16,
                marginTop: 30,
              }}
            >
              <div
                style={{
                  padding: 20,
                  border: "1px solid #ddd",
                  borderRadius: 10,
                }}
              >
                <strong>
                  💵 Dinheiro
                </strong>

                <h2>
                  R${" "}
                  {dinheiro(
                    totalDinheiro
                  )}
                </h2>
              </div>

              <div
                style={{
                  padding: 20,
                  border: "1px solid #ddd",
                  borderRadius: 10,
                }}
              >
                <strong>
                  📱 PIX
                </strong>

                <h2>
                  R${" "}
                  {dinheiro(totalPix)}
                </h2>
              </div>

              <div
                style={{
                  padding: 20,
                  border: "1px solid #ddd",
                  borderRadius: 10,
                }}
              >
                <strong>
                  💳 Crédito
                </strong>

                <h2>
                  R${" "}
                  {dinheiro(
                    totalCredito
                  )}
                </h2>
              </div>

              <div
                style={{
                  padding: 20,
                  border: "1px solid #ddd",
                  borderRadius: 10,
                }}
              >
                <strong>
                  💳 Débito
                </strong>

                <h2>
                  R${" "}
                  {dinheiro(
                    totalDebito
                  )}
                </h2>
              </div>

              <div
                style={{
                  padding: 20,
                  border: "1px solid #ddd",
                  borderRadius: 10,
                }}
              >
                <strong>
                  📝 Fiado
                </strong>

                <h2>
                  R${" "}
                  {dinheiro(
                    totalFiado
                  )}
                </h2>
              </div>
            </section>

            <section
              style={{
                marginTop: 30,
                padding: 24,
                border: "1px solid #ddd",
                borderRadius: 10,
              }}
            >
              <h2>
                Resumo do Caixa
              </h2>

              <p>
                Saldo inicial:{" "}
                <strong>
                  R${" "}
                  {dinheiro(
                    caixa.saldoInicial
                  )}
                </strong>
              </p>

              <p>
                Dinheiro recebido:{" "}
                <strong>
                  R${" "}
                  {dinheiro(
                    totalDinheiro
                  )}
                </strong>
              </p>

              <p>
                PIX:{" "}
                <strong>
                  R${" "}
                  {dinheiro(totalPix)}
                </strong>
              </p>

              <p>
                Crédito:{" "}
                <strong>
                  R${" "}
                  {dinheiro(
                    totalCredito
                  )}
                </strong>
              </p>

              <p>
                Débito:{" "}
                <strong>
                  R${" "}
                  {dinheiro(
                    totalDebito
                  )}
                </strong>
              </p>

              <p>
                Fiado:{" "}
                <strong>
                  R${" "}
                  {dinheiro(
                    totalFiado
                  )}
                </strong>
              </p>

              <hr />

              <p>
                Total de vendas:{" "}
                <strong>
                  R${" "}
                  {dinheiro(
                    totalVendas
                  )}
                </strong>
              </p>

              <p>
                Valor esperado no caixa:{" "}
                <strong>
                  R${" "}
                  {dinheiro(
                    caixa.valorEsperado
                  )}
                </strong>
              </p>

              <hr />

              <h2>
                Fechamento
              </h2>

              <label>
                Valor contado no caixa
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                value={valorInformado}
                onChange={(e) =>
                  setValorInformado(
                    e.target.value
                  )
                }
                placeholder="0,00"
                style={{
                  display: "block",
                  width: 300,
                  padding: 12,
                  marginTop: 8,
                  marginBottom: 20,
                }}
              />

              <Botao
                texto="Conferir Caixa"
                variante="perigo"
                onClick={
                  iniciarFechamento
                }
              />
            </section>

            <section
              style={{
                marginTop: 30,
                padding: 24,
                border: "1px solid #ddd",
                borderRadius: 10,
              }}
            >
              <h2>
                📋 Vendas do Caixa
              </h2>

              {vendasDoCaixa.length ===
              0 ? (
                <p>
                  Nenhuma venda realizada
                  neste caixa.
                </p>
              ) : (
                <div
                  style={{
                    overflowX: "auto",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse:
                        "collapse",
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            textAlign: "left",
                            padding: 10,
                            borderBottom:
                              "1px solid #ddd",
                          }}
                        >
                          Venda
                        </th>

                        <th
                          style={{
                            textAlign: "left",
                            padding: 10,
                            borderBottom:
                              "1px solid #ddd",
                          }}
                        >
                          Pagamento
                        </th>

                        <th
                          style={{
                            textAlign: "left",
                            padding: 10,
                            borderBottom:
                              "1px solid #ddd",
                          }}
                        >
                          Valor
                        </th>

                        <th
                          style={{
                            textAlign: "left",
                            padding: 10,
                            borderBottom:
                              "1px solid #ddd",
                          }}
                        >
                          Data
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {vendasDoCaixa.map(
                        (venda) => (
                          <tr
                            key={
                              venda.id
                            }
                          >
                            <td
                              style={{
                                padding: 10,
                                borderBottom:
                                  "1px solid #eee",
                              }}
                            >
                              #{venda.id}
                            </td>

                            <td
                              style={{
                                padding: 10,
                                borderBottom:
                                  "1px solid #eee",
                              }}
                            >
                              {nomeFormaPagamento(
                                venda.formaPagamento
                              )}
                            </td>

                            <td
                              style={{
                                padding: 10,
                                borderBottom:
                                  "1px solid #eee",
                              }}
                            >
                              R${" "}
                              {dinheiro(
                                Number(
                                  venda.total
                                )
                              )}
                            </td>

                            <td
                              style={{
                                padding: 10,
                                borderBottom:
                                  "1px solid #eee",
                              }}
                            >
                              {new Date(
                                venda.dataVenda
                              ).toLocaleString(
                                "pt-BR"
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section
              style={{
                marginTop: 30,
                padding: 24,
                border: "1px solid #ddd",
                borderRadius: 10,
              }}
            >
              <h2>
                📅 Histórico do Caixa
              </h2>

              <p>
                O histórico dos caixas
                fechados será integrado
                posteriormente pelo
                backend.
              </p>
            </section>
          </>
        )}
      </div>

      {mostrarConferencia && caixa && (
        <div
          className="nao-imprimir"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor:
              "rgba(0, 0, 0, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 30,
              width: "100%",
              maxWidth: 500,
              boxSizing: "border-box",
              boxShadow:
                "0 10px 30px rgba(0,0,0,0.25)",
            }}
          >
            <h2>
              🔎 Conferência do Caixa
            </h2>

            <p>
              Confira os valores antes de
              fechar o caixa.
            </p>

            <hr />

            <p>
              <strong>
                Total de vendas:
              </strong>
            </p>

            <h2>
              R${" "}
              {dinheiro(totalVendas)}
            </h2>

            <p>
              <strong>
                Valor esperado no caixa:
              </strong>
            </p>

            <h2>
              R${" "}
              {dinheiro(
                caixa.valorEsperado
              )}
            </h2>

            <p>
              <strong>
                Valor contado:
              </strong>
            </p>

            <h2>
              R${" "}
              {dinheiro(
                Number(valorInformado)
              )}
            </h2>

            <hr />

            <p>
              Dinheiro recebido:{" "}
              <strong>
                R${" "}
                {dinheiro(
                  totalDinheiro
                )}
              </strong>
            </p>

            <p>
              Fiado:{" "}
              <strong>
                R${" "}
                {dinheiro(totalFiado)}
              </strong>
            </p>

            <p
              style={{
                fontSize: 13,
                color: "#666",
              }}
            >
              O valor fiado entra no total
              de vendas, mas não representa
              dinheiro recebido no caixa.
            </p>

            {diferencaConferencia > 0 && (
              <div
                style={{
                  padding: 16,
                  borderRadius: 8,
                  backgroundColor:
                    "#e8f5e9",
                  marginBottom: 20,
                }}
              >
                <h2>
                  🟢 SOBRA
                </h2>

                <p>
                  O caixa possui uma sobra
                  de:
                </p>

                <strong
                  style={{
                    fontSize: 24,
                  }}
                >
                  R${" "}
                  {dinheiro(
                    diferencaConferencia
                  )}
                </strong>
              </div>
            )}

            {diferencaConferencia < 0 && (
              <div
                style={{
                  padding: 16,
                  borderRadius: 8,
                  backgroundColor:
                    "#ffebee",
                  marginBottom: 20,
                }}
              >
                <h2>
                  🔴 FALTA
                </h2>

                <p>
                  O caixa possui uma falta
                  de:
                </p>

                <strong
                  style={{
                    fontSize: 24,
                  }}
                >
                  R${" "}
                  {dinheiro(
                    Math.abs(
                      diferencaConferencia
                    )
                  )}
                </strong>
              </div>
            )}

            {diferencaConferencia === 0 && (
              <div
                style={{
                  padding: 16,
                  borderRadius: 8,
                  backgroundColor:
                    "#e8f5e9",
                  marginBottom: 20,
                }}
              >
                <h2>
                  ✅ CAIXA CONFERIDO
                </h2>

                <p>
                  O valor contado é
                  exatamente igual ao
                  valor esperado.
                </p>
              </div>
            )}

            <p>
              Deseja realmente fechar o
              caixa?
            </p>

            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 20,
              }}
            >
              <Botao
                texto="Cancelar"
                variante="secundario"
                onClick={
                  cancelarFechamento
                }
              />

              <Botao
                texto={
                  carregando
                    ? "Fechando..."
                    : "Confirmar Fechamento"
                }
                variante="perigo"
                onClick={
                  confirmarFechamento
                }
              />
            </div>
          </div>
        </div>
      )}

      {fechamentoParaImprimir && (
        <section className="area-impressao">
          <h1
            style={{
              textAlign: "center",
            }}
          >
            FECHAMENTO DE CAIXA
          </h1>

          <hr />

          <p>
            <strong>Caixa:</strong>{" "}
            {fechamentoParaImprimir.caixaId
              ? `#${fechamentoParaImprimir.caixaId}`
              : "Não informado"}
          </p>

          <p>
            <strong>Abertura:</strong>{" "}
            {fechamentoParaImprimir.abertoEm
              ? new Date(
                  fechamentoParaImprimir.abertoEm
                ).toLocaleString("pt-BR")
              : "Não informado"}
          </p>

          <p>
            <strong>Fechamento:</strong>{" "}
            {new Date(
              fechamentoParaImprimir.fechadoEm
            ).toLocaleString("pt-BR")}
          </p>

          <hr />

          <h2>Resumo financeiro</h2>

          <p>
            Saldo inicial:{" "}
            <strong>
              R${" "}
              {dinheiro(
                fechamentoParaImprimir.saldoInicial
              )}
            </strong>
          </p>

          <p>
            Dinheiro:{" "}
            <strong>
              R${" "}
              {dinheiro(
                fechamentoParaImprimir.totalDinheiro
              )}
            </strong>
          </p>

          <p>
            PIX:{" "}
            <strong>
              R${" "}
              {dinheiro(
                fechamentoParaImprimir.totalPix
              )}
            </strong>
          </p>

          <p>
            Crédito:{" "}
            <strong>
              R${" "}
              {dinheiro(
                fechamentoParaImprimir.totalCredito
              )}
            </strong>
          </p>

          <p>
            Débito:{" "}
            <strong>
              R${" "}
              {dinheiro(
                fechamentoParaImprimir.totalDebito
              )}
            </strong>
          </p>

          <p>
            Fiado:{" "}
            <strong>
              R${" "}
              {dinheiro(
                fechamentoParaImprimir.totalFiado
              )}
            </strong>
          </p>

          <hr />

          <h2>
            Total de vendas: R${" "}
            {dinheiro(
              fechamentoParaImprimir.totalVendas
            )}
          </h2>

          <p>
            Valor esperado no caixa:{" "}
            <strong>
              R${" "}
              {dinheiro(
                fechamentoParaImprimir.valorEsperado
              )}
            </strong>
          </p>

          <p>
            Valor contado:{" "}
            <strong>
              R${" "}
              {dinheiro(
                fechamentoParaImprimir.valorInformado
              )}
            </strong>
          </p>

          <p>
            Diferença:{" "}
            <strong>
              R${" "}
              {dinheiro(
                fechamentoParaImprimir.diferenca
              )}
            </strong>
          </p>

          <hr />

          <p
            style={{
              textAlign: "center",
              marginTop: 40,
            }}
          >
            Documento de conferência de
            fechamento de caixa.
          </p>
        </section>
      )}
    </main>
  );
};

export default Caixa;