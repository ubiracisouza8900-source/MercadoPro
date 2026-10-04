import React, { useEffect, useState } from "react";
import axios from "axios";
import Botao from "../components/Botao";
import api from "../services/api";

interface ResumoRelatorio {
  totalVendas: number;
  quantidadeVendas: number;
  totalCompras: number;
  contasReceber: number;
  contasPagar: number;
  valorEstoque: number;
}

interface VendaPorPagamento {
  formaPagamento: string;
  quantidade: number;
  valor: number;
}

interface ProdutoMaisVendido {
  produtoId: number;
  produtoNome: string;
  quantidade: number;
  valor: number;
}

interface RespostaErroApi {
  erro?: string;
  message?: string;
}

const Relatorios: React.FC = () => {
  const [resumo, setResumo] =
    useState<ResumoRelatorio | null>(null);

  const [vendasPorPagamento, setVendasPorPagamento] =
    useState<VendaPorPagamento[]>([]);

  const [produtosMaisVendidos, setProdutosMaisVendidos] =
    useState<ProdutoMaisVendido[]>([]);

  const [dataInicio, setDataInicio] =
    useState("");

  const [dataFim, setDataFim] =
    useState("");

  const [carregando, setCarregando] =
    useState(false);

  function obterMensagemErro(
    erro: unknown
  ): string {
    if (axios.isAxiosError<RespostaErroApi>(erro)) {
      return (
        erro.response?.data?.erro ??
        erro.response?.data?.message ??
        "Erro ao gerar relatório."
      );
    }

    return "Erro ao gerar relatório.";
  }

  function aplicarMascaraData(
    valor: string
  ): string {
    const numeros = valor
      .replace(/\D/g, "")
      .slice(0, 8);

    if (numeros.length <= 2) {
      return numeros;
    }

    if (numeros.length <= 4) {
      return (
        numeros.slice(0, 2) +
        "/" +
        numeros.slice(2)
      );
    }

    return (
      numeros.slice(0, 2) +
      "/" +
      numeros.slice(2, 4) +
      "/" +
      numeros.slice(4)
    );
  }

  function converterDataParaApi(
    data: string
  ): string | undefined {
    if (!data) {
      return undefined;
    }

    const resultado =
      /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(
        data
      );

    if (!resultado) {
      return undefined;
    }

    const dia = Number(resultado[1]);
    const mes = Number(resultado[2]);
    const ano = Number(resultado[3]);

    const dataTeste = new Date(
      ano,
      mes - 1,
      dia
    );

    if (
      dataTeste.getFullYear() !== ano ||
      dataTeste.getMonth() !== mes - 1 ||
      dataTeste.getDate() !== dia
    ) {
      return undefined;
    }

    return `${ano}-${String(mes).padStart(
      2,
      "0"
    )}-${String(dia).padStart(2, "0")}`;
  }

  async function gerarRelatorio(): Promise<void> {
    try {
      setCarregando(true);

      const dataInicioApi =
        converterDataParaApi(dataInicio);

      const dataFimApi =
        converterDataParaApi(dataFim);

      if (dataInicio && !dataInicioApi) {
        alert(
          "A data inicial deve estar no formato DD/MM/AAAA."
        );
        return;
      }

      if (dataFim && !dataFimApi) {
        alert(
          "A data final deve estar no formato DD/MM/AAAA."
        );
        return;
      }

      const parametros = {
        ...(dataInicioApi
          ? { dataInicio: dataInicioApi }
          : {}),
        ...(dataFimApi
          ? { dataFim: dataFimApi }
          : {}),
      };

      const [
        respostaResumo,
        respostaPagamentos,
        respostaProdutos,
      ] = await Promise.all([
        api.get<ResumoRelatorio>(
          "/relatorios/resumo",
          {
            params: parametros,
          }
        ),

        api.get<VendaPorPagamento[]>(
          "/relatorios/vendas-por-pagamento",
          {
            params: parametros,
          }
        ),

        api.get<ProdutoMaisVendido[]>(
          "/relatorios/produtos-mais-vendidos",
          {
            params: parametros,
          }
        ),
      ]);

      setResumo(respostaResumo.data);

      setVendasPorPagamento(
        respostaPagamentos.data
      );

      setProdutosMaisVendidos(
        respostaProdutos.data
      );
    } catch (erro: unknown) {
      console.error(
        "Erro ao gerar relatório:",
        erro
      );

      alert(
        obterMensagemErro(erro)
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    async function iniciar(): Promise<void> {
      await gerarRelatorio();
    }

    void iniciar();
  }, []);

  function formatarMoeda(
    valor: number
  ): string {
    return valor.toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );
  }

  function nomeFormaPagamento(
    forma: string
  ): string {
    const formas: Record<
      string,
      string
    > = {
      dinheiro: "Dinheiro",
      pix: "PIX",
      credito: "Cartão de Crédito",
      debito: "Cartão de Débito",
      fiado: "Fiado",
    };

    return (
      formas[forma] ?? forma
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h2>Relatórios</h2>

      <section
        style={{
          display: "flex",
          gap: 12,
          alignItems: "end",
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <div>
          <label
            htmlFor="data-inicio"
            style={{
              display: "block",
              marginBottom: 6,
            }}
          >
            Data inicial
          </label>

          <input
            id="data-inicio"
            type="text"
            inputMode="numeric"
            placeholder="DD/MM/AAAA"
            maxLength={10}
            value={dataInicio}
            onChange={(e) =>
              setDataInicio(
                aplicarMascaraData(
                  e.target.value
                )
              )
            }
            style={{
              padding: "9px 10px",
              border: "1px solid #ccc",
              borderRadius: 6,
              fontSize: 15,
              width: 130,
            }}
          />
        </div>

        <div>
          <label
            htmlFor="data-fim"
            style={{
              display: "block",
              marginBottom: 6,
            }}
          >
            Data final
          </label>

          <input
            id="data-fim"
            type="text"
            inputMode="numeric"
            placeholder="DD/MM/AAAA"
            maxLength={10}
            value={dataFim}
            onChange={(e) =>
              setDataFim(
                aplicarMascaraData(
                  e.target.value
                )
              )
            }
            style={{
              padding: "9px 10px",
              border: "1px solid #ccc",
              borderRadius: 6,
              fontSize: 15,
              width: 130,
            }}
          />
        </div>

        <Botao
          texto={
            carregando
              ? "Carregando..."
              : "Gerar relatório"
          }
          onClick={
            gerarRelatorio
          }
        />
      </section>

      {resumo && (
        <>
          <section
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
              marginBottom: 30,
            }}
          >
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 20,
              }}
            >
              <h3>Total de vendas</h3>

              <strong>
                {formatarMoeda(
                  resumo.totalVendas
                )}
              </strong>
            </div>

            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 20,
              }}
            >
              <h3>Quantidade de vendas</h3>

              <strong>
                {resumo.quantidadeVendas}
              </strong>
            </div>

            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 20,
              }}
            >
              <h3>Total de compras</h3>

              <strong>
                {formatarMoeda(
                  resumo.totalCompras
                )}
              </strong>
            </div>

            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 20,
              }}
            >
              <h3>A receber</h3>

              <strong>
                {formatarMoeda(
                  resumo.contasReceber
                )}
              </strong>
            </div>

            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 20,
              }}
            >
              <h3>A pagar</h3>

              <strong>
                {formatarMoeda(
                  resumo.contasPagar
                )}
              </strong>
            </div>

            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 20,
              }}
            >
              <h3>Valor do estoque</h3>

              <strong>
                {formatarMoeda(
                  resumo.valorEstoque
                )}
              </strong>
            </div>
          </section>

          <section
            style={{
              marginBottom: 30,
            }}
          >
            <h3>
              Vendas por forma de pagamento
            </h3>

            {vendasPorPagamento.length ===
            0 ? (
              <p>
                Nenhuma venda encontrada.
              </p>
            ) : (
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
                        textAlign:
                          "left",
                        padding: 8,
                      }}
                    >
                      Forma de pagamento
                    </th>

                    <th
                      style={{
                        textAlign:
                          "left",
                        padding: 8,
                      }}
                    >
                      Quantidade
                    </th>

                    <th
                      style={{
                        textAlign:
                          "left",
                        padding: 8,
                      }}
                    >
                      Valor
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {vendasPorPagamento.map(
                    (item) => (
                      <tr
                        key={
                          item.formaPagamento
                        }
                      >
                        <td
                          style={{
                            padding: 8,
                          }}
                        >
                          {nomeFormaPagamento(
                            item.formaPagamento
                          )}
                        </td>

                        <td
                          style={{
                            padding: 8,
                          }}
                        >
                          {item.quantidade}
                        </td>

                        <td
                          style={{
                            padding: 8,
                          }}
                        >
                          {formatarMoeda(
                            item.valor
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            )}
          </section>

          <section>
            <h3>
              Produtos mais vendidos
            </h3>

            {produtosMaisVendidos.length ===
            0 ? (
              <p>
                Nenhum produto vendido
                encontrado.
              </p>
            ) : (
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
                        textAlign:
                          "left",
                        padding: 8,
                      }}
                    >
                      Produto
                    </th>

                    <th
                      style={{
                        textAlign:
                          "left",
                        padding: 8,
                      }}
                    >
                      Quantidade
                    </th>

                    <th
                      style={{
                        textAlign:
                          "left",
                        padding: 8,
                      }}
                    >
                      Valor vendido
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {produtosMaisVendidos.map(
                    (produto) => (
                      <tr
                        key={
                          produto.produtoId
                        }
                      >
                        <td
                          style={{
                            padding: 8,
                          }}
                        >
                          {
                            produto.produtoNome
                          }
                        </td>

                        <td
                          style={{
                            padding: 8,
                          }}
                        >
                          {
                            produto.quantidade
                          }
                        </td>

                        <td
                          style={{
                            padding: 8,
                          }}
                        >
                          {formatarMoeda(
                            produto.valor
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </main>
  );
};

export default Relatorios;