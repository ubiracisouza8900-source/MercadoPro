import React, { useEffect, useState } from "react";

import Input from "../components/Input";
import Botao from "../components/Botao";
import Tabela, { ColunaTabela } from "../components/Tabela";

import { ItemVenda } from "../types/Venda";
import api from "../services/api";

type FormaPagamento =
  | "dinheiro"
  | "pix"
  | "credito"
  | "debito";

interface Produto {
  produtoId: number;
  nome: string;
  codigoBarras?: string;
  precoVenda: number;
  quantidadeEstoque: number;
}

interface Cliente {
  clienteId: number;
  nome: string;
  documento?: string;
  telefone?: string;
}

interface VendaCriada {
  id: number;
  clienteId?: number | null;
  usuarioId: number;
  caixaId?: number | null;
  total: number;
  formaPagamento: FormaPagamento;
  dataVenda: string;
}

interface ItemVendaEnvio {
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
}

const PDV: React.FC = () => {
  const [codigo, setCodigo] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [itens, setItens] = useState<ItemVenda[]>([]);

  const [formaPagamento, setFormaPagamento] =
    useState<FormaPagamento>("dinheiro");

  const [valorRecebido, setValorRecebido] =
    useState("");

  const [carregando, setCarregando] =
    useState(false);

  const [ultimoProduto, setUltimoProduto] =
    useState<Produto | null>(null);

  const [vendaFinalizada, setVendaFinalizada] =
    useState<VendaCriada | null>(null);

  const [clienteBusca, setClienteBusca] =
    useState("");

  const [clientes, setClientes] =
    useState<Cliente[]>([]);

  const [clienteSelecionado, setClienteSelecionado] =
    useState<Cliente | null>(null);

  const [buscandoCliente, setBuscandoCliente] =
    useState(false);

  const total = itens.reduce(
    (soma, item) =>
      soma +
      item.quantidade * item.precoUnitario,
    0
  );

  const quantidadeTotal = itens.reduce(
    (soma, item) =>
      soma + item.quantidade,
    0
  );

  const valorRecebidoNumero =
    Number(
      valorRecebido.replace(",", ".")
    ) || 0;

  const troco =
    valorRecebidoNumero - total;

  function dinheiro(valor: number) {
    return valor.toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );
  }

  function nomeFormaPagamento(
    forma: FormaPagamento
  ) {
    const nomes: Record<
      FormaPagamento,
      string
    > = {
      dinheiro: "Dinheiro",
      pix: "PIX",
      credito: "Cartão de crédito",
      debito: "Cartão de débito",
    };

    return nomes[forma];
  }

  useEffect(() => {
    const busca = clienteBusca.trim();

    if (!busca || clienteSelecionado) {
      return;
    }

    const temporizador = setTimeout(
      async () => {
        try {
          setBuscandoCliente(true);

          const resposta = await api.get(
            `/clientes?busca=${encodeURIComponent(
              busca
            )}`
          );

          setClientes(
            Array.isArray(resposta.data)
              ? resposta.data
              : []
          );
        } catch (erro: unknown) {
          console.error(
            "Erro ao pesquisar cliente:",
            erro
          );

          setClientes([]);
        } finally {
          setBuscandoCliente(false);
        }
      },
      300
    );

    return () => {
      clearTimeout(temporizador);
    };
  }, [
    clienteBusca,
    clienteSelecionado,
  ]);

  function selecionarCliente(
    cliente: Cliente
  ) {
    setClienteSelecionado(cliente);
    setClienteBusca("");
    setClientes([]);
  }

  function removerCliente() {
    setClienteSelecionado(null);
    setClienteBusca("");
    setClientes([]);
  }

  async function adicionarItem() {
    const codigoLido = codigo.trim();

    const quantidadeInformada =
      Number(
        quantidade.replace(",", ".")
      );

    if (!codigoLido) {
      alert(
        "Digite ou bipe o código de barras."
      );
      return;
    }

    if (
      !Number.isFinite(
        quantidadeInformada
      ) ||
      quantidadeInformada <= 0
    ) {
      alert(
        "Informe uma quantidade válida."
      );
      return;
    }

    try {
      const resposta =
        await api.get<Produto>(
          `/produtos/codigo/${encodeURIComponent(
            codigoLido
          )}`
        );

      const produto = resposta.data;

      if (
        !produto ||
        !Number.isInteger(
          Number(produto.produtoId)
        ) ||
        Number(produto.produtoId) <= 0
      ) {
        alert(
          "Produto não encontrado."
        );
        return;
      }

      const produtoId =
        Number(produto.produtoId);

      const precoUnitario =
        Number(produto.precoVenda);

      const estoqueDisponivel =
        Number(
          produto.quantidadeEstoque
        );

      if (
        !Number.isFinite(
          precoUnitario
        ) ||
        precoUnitario < 0
      ) {
        alert(
          "Preço do produto inválido."
        );
        return;
      }

      if (
        !Number.isFinite(
          estoqueDisponivel
        ) ||
        estoqueDisponivel < 0
      ) {
        alert(
          "Estoque do produto inválido."
        );
        return;
      }

      setUltimoProduto(produto);

      const itemExistente =
        itens.find(
          (item) =>
            Number(item.produtoId) ===
            produtoId
        );

      const quantidadeAtual =
        itemExistente?.quantidade ?? 0;

      const novaQuantidade =
        quantidadeAtual +
        quantidadeInformada;

      if (
        novaQuantidade >
        estoqueDisponivel
      ) {
        alert(
          `Estoque insuficiente. Disponível: ${estoqueDisponivel}.`
        );
        return;
      }

      if (itemExistente) {
        setItens((atual) =>
          atual.map((item) =>
            item.produtoId === produtoId
              ? {
                  ...item,
                  quantidade:
                    novaQuantidade,
                  precoUnitario,
                }
              : item
          )
        );
      } else {
        setItens((atual) => [
          ...atual,
          {
            produtoId,
            produtoNome:
              produto.nome,
            quantidade:
              quantidadeInformada,
            precoUnitario,
          },
        ]);
      }

      setCodigo("");
      setQuantidade("1");
    } catch (erro: unknown) {
      console.error(
        "Erro ao buscar produto:",
        erro
      );

      alert(
        "Não foi possível localizar o produto. Confira o código."
      );
    }
  }

  function alterarQuantidade(
    produtoId: number,
    novaQuantidade: number
  ) {
    if (
      !Number.isFinite(
        novaQuantidade
      ) ||
      novaQuantidade <= 0
    ) {
      return;
    }

    setItens((atual) =>
      atual.map((item) =>
        item.produtoId === produtoId
          ? {
              ...item,
              quantidade:
                novaQuantidade,
            }
          : item
      )
    );
  }

  function removerItem(
    produtoId: number
  ) {
    setItens((atual) =>
      atual.filter(
        (item) =>
          item.produtoId !==
          produtoId
      )
    );
  }

  function limparVenda() {
    if (itens.length === 0) {
      return;
    }

    const confirmar =
      window.confirm(
        "Deseja cancelar esta venda?"
      );

    if (!confirmar) {
      return;
    }

    setItens([]);
    setCodigo("");
    setQuantidade("1");
    setValorRecebido("");
    setFormaPagamento(
      "dinheiro"
    );
    setUltimoProduto(null);

    setClienteSelecionado(null);
    setClienteBusca("");
    setClientes([]);
  }

  function fecharComprovante() {
    setVendaFinalizada(null);

    setItens([]);
    setCodigo("");
    setQuantidade("1");
    setValorRecebido("");
    setFormaPagamento(
      "dinheiro"
    );
    setUltimoProduto(null);

    setClienteSelecionado(null);
    setClienteBusca("");
    setClientes([]);
  }

  async function finalizarVenda() {
    if (itens.length === 0) {
      alert(
        "Adicione pelo menos um produto."
      );
      return;
    }

    if (
      formaPagamento ===
      "dinheiro"
    ) {
      if (
        valorRecebido.trim() === ""
      ) {
        alert(
          "Informe o valor recebido."
        );
        return;
      }

      if (
        valorRecebidoNumero <
        total
      ) {
        alert(
          `O valor recebido é menor que o total da venda. Faltam ${dinheiro(
            total -
              valorRecebidoNumero
          )}.`
        );
        return;
      }
    }

    const itensVenda: ItemVendaEnvio[] =
      itens.map((item) => ({
        produtoId:
          Number(item.produtoId),
        quantidade:
          Number(item.quantidade),
        precoUnitario:
          Number(item.precoUnitario),
      }));

    const itemInvalido =
      itensVenda.find(
        (item) =>
          !Number.isInteger(
            item.produtoId
          ) ||
          item.produtoId <= 0 ||
          !Number.isFinite(
            item.quantidade
          ) ||
          item.quantidade <= 0 ||
          !Number.isFinite(
            item.precoUnitario
          ) ||
          item.precoUnitario < 0
      );

    if (itemInvalido) {
      console.error(
        "Item inválido:",
        itemInvalido
      );

      alert(
        "Existe um produto com dados inválidos no carrinho. Remova e adicione o produto novamente."
      );

      return;
    }

    try {
      setCarregando(true);

      const resposta =
        await api.post<VendaCriada>(
          "/vendas",
          {
            clienteId:
              clienteSelecionado?.clienteId ??
              null,

            itens: itensVenda,

            formaPagamento,

            valorRecebido:
              formaPagamento ===
              "dinheiro"
                ? valorRecebidoNumero
                : total,

            total,
          }
        );

      const venda =
        resposta.data;

      setVendaFinalizada(venda);
    } catch (erro: unknown) {
      console.error(
        "Erro ao finalizar venda:",
        erro
      );

      alert(
        "Não foi possível finalizar a venda."
      );
    } finally {
      setCarregando(false);
    }
  }

  const colunas: ColunaTabela<ItemVenda>[] =
    [
      {
        chave: "produtoNome",
        titulo: "Produto",
        render: (_, item) => (
          <div>
            <strong>
              {item.produtoNome}
            </strong>

            <div
              style={{
                marginTop: 4,
                fontSize: 12,
                color: "#777",
              }}
            >
              Código:{" "}
              {item.produtoId}
            </div>
          </div>
        ),
      },

      {
        chave: "quantidade",
        titulo: "Quantidade",
        render: (_, item) => (
          <div
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: 6,
            }}
          >
            <button
              type="button"
              onClick={() =>
                alterarQuantidade(
                  item.produtoId,
                  item.quantidade - 1
                )
              }
              disabled={
                item.quantidade <= 1
              }
              style={{
                width: 32,
                height: 32,
                borderRadius: 5,
                border:
                  "1px solid #ccc",
                cursor:
                  item.quantidade <=
                  1
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              −
            </button>

            <input
              type="number"
              min="0.001"
              step="0.001"
              value={
                item.quantidade
              }
              onChange={(evento) =>
                alterarQuantidade(
                  item.produtoId,
                  Number(
                    evento.target
                      .value
                  )
                )
              }
              style={{
                width: 70,
                height: 30,
                textAlign:
                  "center",
                border:
                  "1px solid #ccc",
                borderRadius: 5,
              }}
            />

            <button
              type="button"
              onClick={() =>
                alterarQuantidade(
                  item.produtoId,
                  item.quantidade + 1
                )
              }
              style={{
                width: 32,
                height: 32,
                borderRadius: 5,
                border:
                  "1px solid #ccc",
                cursor: "pointer",
              }}
            >
              +
            </button>
          </div>
        ),
      },

      {
        chave: "precoUnitario",
        titulo: "Preço",
        render: (valor) =>
          dinheiro(
            Number(valor)
          ),
      },

      {
        chave: "produtoId",
        titulo: "Subtotal",
        render: (_, item) => (
          <strong>
            {dinheiro(
              item.quantidade *
                item.precoUnitario
            )}
          </strong>
        ),
      },

      {
        chave: "produtoNome",
        titulo: "",
        render: (_, item) => (
          <button
            type="button"
            onClick={() =>
              removerItem(
                item.produtoId
              )
            }
            style={{
              border: "none",
              background:
                "transparent",
              color: "#dc2626",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Remover
          </button>
        ),
      },
    ];

  return (
    <main
      style={{
        padding: 24,
        maxWidth: 1500,
        margin: "0 auto",
      }}
    >
      <header
        style={{
          marginBottom: 24,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 30,
          }}
        >
          Frente de Caixa
        </h1>

        <p
          style={{
            marginTop: 8,
            color: "#666",
          }}
        >
          Registre os produtos e
          finalize a venda.
        </p>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(0, 1fr) 380px",
          gap: 24,
          alignItems: "start",
        }}
      >
        <div>
          <section
            style={{
              padding: 20,
              border:
                "1px solid #ddd",
              borderRadius: 10,
              background: "#fff",
            }}
          >
            <h2
              style={{
                marginTop: 0,
              }}
            >
              Leitura de produto
            </h2>

            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems:
                  "flex-end",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  flex: 1,
                  minWidth: 240,
                }}
              >
                <Input
                  label="Código de barras"
                  valor={codigo}
                  aoAlterar={
                    setCodigo
                  }
                  placeholder="Bipe ou digite o código"
                />
              </div>

              <div
                style={{
                  width: 120,
                }}
              >
                <Input
                  label="Quantidade"
                  valor={quantidade}
                  aoAlterar={
                    setQuantidade
                  }
                  placeholder="1"
                />
              </div>

              <Botao
                texto="Adicionar"
                onClick={
                  adicionarItem
                }
              />
            </div>
          </section>

          {ultimoProduto && (
            <section
              style={{
                marginTop: 16,
                padding: 16,
                borderRadius: 10,
                border:
                  "1px solid #bfdbfe",
                background:
                  "#eff6ff",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "#2563eb",
                  fontWeight: 700,
                  marginBottom: 6,
                  textTransform:
                    "uppercase",
                }}
              >
                Último produto
                lançado
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  gap: 16,
                  flexWrap:
                    "wrap",
                }}
              >
                <div>
                  <strong
                    style={{
                      fontSize: 19,
                    }}
                  >
                    {
                      ultimoProduto.nome
                    }
                  </strong>

                  <div
                    style={{
                      marginTop: 5,
                      color: "#555",
                      fontSize: 13,
                    }}
                  >
                    Código de barras:{" "}
                    {ultimoProduto.codigoBarras ||
                      ultimoProduto.produtoId}
                  </div>
                </div>

                <div
                  style={{
                    textAlign:
                      "right",
                  }}
                >
                  <strong
                    style={{
                      fontSize: 20,
                    }}
                  >
                    {dinheiro(
                      Number(
                        ultimoProduto.precoVenda
                      )
                    )}
                  </strong>

                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      color: "#555",
                    }}
                  >
                    Estoque disponível:{" "}
                    {
                      ultimoProduto.quantidadeEstoque
                    }
                  </div>
                </div>
              </div>
            </section>
          )}

          <section
            style={{
              marginTop: 24,
              padding: 20,
              border:
                "1px solid #ddd",
              borderRadius: 10,
              background: "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom: 16,
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                  }}
                >
                  Produtos da venda
                </h2>

                <p
                  style={{
                    margin:
                      "6px 0 0",
                    color: "#666",
                  }}
                >
                  {
                    quantidadeTotal
                  }{" "}
                  item(ns)
                </p>
              </div>

              {itens.length >
                0 && (
                <button
                  type="button"
                  onClick={
                    limparVenda
                  }
                  style={{
                    border: "none",
                    background:
                      "#fee2e2",
                    color:
                      "#b91c1c",
                    padding:
                      "9px 14px",
                    borderRadius: 6,
                    cursor:
                      "pointer",
                    fontWeight:
                      600,
                  }}
                >
                  Cancelar venda
                </button>
              )}
            </div>

            {itens.length ===
            0 ? (
              <div
                style={{
                  padding: 50,
                  textAlign:
                    "center",
                  border:
                    "1px dashed #ccc",
                  borderRadius: 8,
                  color: "#777",
                }}
              >
                <div
                  style={{
                    fontSize: 40,
                    marginBottom: 10,
                  }}
                >
                  🛒
                </div>

                <h3>
                  Carrinho vazio
                </h3>

                <p>
                  Bipe ou digite o
                  código de barras
                  para adicionar
                  produtos.
                </p>
              </div>
            ) : (
              <Tabela
                colunas={
                  colunas
                }
                dados={itens}
                chaveLinha={(
                  item
                ) =>
                  item.produtoId
                }
              />
            )}
          </section>
        </div>

        <aside
          style={{
            position:
              "sticky",
            top: 20,
            padding: 22,
            border:
              "1px solid #ddd",
            borderRadius: 10,
            background: "#fff",
          }}
        >
          <h2
            style={{
              marginTop: 0,
            }}
          >
            Resumo da venda
          </h2>

          <section
            style={{
              marginBottom: 24,
              padding: 14,
              border:
                "1px solid #ddd",
              borderRadius: 8,
              background: "#f9fafb",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: 12,
              }}
            >
              Cliente
            </h3>

            {clienteSelecionado ? (
              <div
                style={{
                  padding: 12,
                  borderRadius: 8,
                  background:
                    "#eff6ff",
                  border:
                    "1px solid #bfdbfe",
                }}
              >
                <strong>
                  {
                    clienteSelecionado.nome
                  }
                </strong>

                {clienteSelecionado.documento && (
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 13,
                      color: "#555",
                    }}
                  >
                    Documento:{" "}
                    {
                      clienteSelecionado.documento
                    }
                  </div>
                )}

                <button
                  type="button"
                  onClick={
                    removerCliente
                  }
                  style={{
                    marginTop: 10,
                    border: "none",
                    background:
                      "transparent",
                    color:
                      "#dc2626",
                    cursor:
                      "pointer",
                    fontWeight: 600,
                    padding: 0,
                  }}
                >
                  Trocar cliente
                </button>
              </div>
            ) : (
              <>
                <Input
                  label="Pesquisar cliente"
                  valor={
                    clienteBusca
                  }
                  aoAlterar={
                    setClienteBusca
                  }
                  placeholder="Digite nome ou CPF"
                />

                {buscandoCliente && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 13,
                      color: "#666",
                    }}
                  >
                    Pesquisando...
                  </div>
                )}

                {clientes.length >
                  0 && (
                  <div
                    style={{
                      marginTop: 10,
                      border:
                        "1px solid #ddd",
                      borderRadius: 6,
                      background:
                        "#fff",
                      overflow:
                        "hidden",
                    }}
                  >
                    {clientes.map(
                      (cliente) => (
                        <button
                          key={
                            cliente.clienteId
                          }
                          type="button"
                          onClick={() =>
                            selecionarCliente(
                              cliente
                            )
                          }
                          style={{
                            display:
                              "block",
                            width:
                              "100%",
                            padding: 12,
                            textAlign:
                              "left",
                            border:
                              "none",
                            borderBottom:
                              "1px solid #eee",
                            background:
                              "#fff",
                            cursor:
                              "pointer",
                          }}
                        >
                          <strong>
                            {
                              cliente.nome
                            }
                          </strong>

                          {cliente.documento && (
                            <div
                              style={{
                                marginTop: 3,
                                fontSize: 12,
                                color:
                                  "#666",
                              }}
                            >
                              {
                                cliente.documento
                              }
                            </div>
                          )}
                        </button>
                      )
                    )}
                  </div>
                )}

                {clienteBusca.trim() &&
                  !buscandoCliente &&
                  clientes.length ===
                    0 && (
                    <p
                      style={{
                        marginBottom: 0,
                        fontSize: 13,
                        color:
                          "#777",
                      }}
                    >
                      Nenhum cliente
                      encontrado.
                    </p>
                  )}
              </>
            )}
          </section>

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              marginBottom: 10,
            }}
          >
            <span>
              Quantidade de itens
            </span>

            <strong>
              {quantidadeTotal}
            </strong>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              marginBottom: 18,
            }}
          >
            <span>
              Produtos
            </span>

            <strong>
              {itens.length}
            </strong>
          </div>

          <hr />

          <div
            style={{
              marginTop: 20,
              marginBottom: 24,
            }}
          >
            <span
              style={{
                color: "#666",
              }}
            >
              Total da venda
            </span>

            <div
              style={{
                fontSize: 34,
                fontWeight: 700,
                marginTop: 6,
              }}
            >
              {dinheiro(total)}
            </div>
          </div>

          <h3>
            Forma de pagamento
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: 8,
            }}
          >
            {(
              [
                [
                  "dinheiro",
                  "Dinheiro",
                ],
                ["pix", "PIX"],
                [
                  "credito",
                  "Crédito",
                ],
                [
                  "debito",
                  "Débito",
                ],
              ] as [
                FormaPagamento,
                string
              ][]
            ).map(
              ([
                valor,
                texto,
              ]) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => {
                    setFormaPagamento(
                      valor
                    );

                    if (
                      valor !==
                      "dinheiro"
                    ) {
                      setValorRecebido(
                        ""
                      );
                    }
                  }}
                  style={{
                    padding:
                      "12px 8px",
                    borderRadius: 6,
                    border:
                      formaPagamento ===
                      valor
                        ? "2px solid #2563eb"
                        : "1px solid #ccc",
                    background:
                      formaPagamento ===
                      valor
                        ? "#dbeafe"
                        : "#fff",
                    cursor:
                      "pointer",
                    fontWeight:
                      600,
                  }}
                >
                  {texto}
                </button>
              )
            )}
          </div>

          {formaPagamento ===
            "dinheiro" && (
            <div
              style={{
                marginTop: 18,
              }}
            >
              <Input
                label="Valor recebido"
                valor={
                  valorRecebido
                }
                aoAlterar={
                  setValorRecebido
                }
                placeholder="Ex.: 30,00"
              />

              {valorRecebidoNumero >
                total &&
                total > 0 && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 12,
                      borderRadius: 6,
                      background:
                        "#dcfce7",
                      border:
                        "1px solid #86efac",
                    }}
                  >
                    <span>
                      Troco
                    </span>

                    <strong
                      style={{
                        display:
                          "block",
                        fontSize: 22,
                        marginTop: 4,
                        color:
                          "#166534",
                      }}
                    >
                      {dinheiro(
                        troco
                      )}
                    </strong>
                  </div>
                )}

              {valorRecebidoNumero >
                0 &&
                valorRecebidoNumero <
                  total && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 12,
                      borderRadius: 6,
                      background:
                        "#fee2e2",
                      border:
                        "1px solid #fecaca",
                      color:
                        "#b91c1c",
                    }}
                  >
                    Falta{" "}
                    <strong>
                      {dinheiro(
                        total -
                          valorRecebidoNumero
                      )}
                    </strong>
                  </div>
                )}
            </div>
          )}

          <div
            style={{
              marginTop: 24,
            }}
          >
            <Botao
              texto={
                carregando
                  ? "Finalizando..."
                  : "Finalizar venda"
              }
              variante="sucesso"
              onClick={
                finalizarVenda
              }
            />
          </div>
        </aside>
      </section>

      {vendaFinalizada && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0, 0, 0, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 420,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              boxSizing: "border-box",
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                textAlign: "center",
                borderBottom:
                  "1px dashed #999",
                paddingBottom: 16,
                marginBottom: 16,
              }}
            >
              <h2
                style={{
                  margin: 0,
                }}
              >
                MERCADOPRO
              </h2>

              <p
                style={{
                  margin:
                    "6px 0 0",
                  color: "#666",
                  fontSize: 13,
                }}
              >
                Comprovante de venda
              </p>

              <p
                style={{
                  margin:
                    "6px 0 0",
                  fontSize: 13,
                }}
              >
                Venda #
                {
                  vendaFinalizada.id
                }
              </p>
            </div>

            <div
              style={{
                marginBottom: 16,
                fontSize: 13,
              }}
            >
              <p
                style={{
                  margin:
                    "4px 0",
                }}
              >
                <strong>Data:</strong>{" "}
                {new Date(
                  vendaFinalizada.dataVenda
                ).toLocaleString(
                  "pt-BR"
                )}
              </p>

              {clienteSelecionado && (
                <p
                  style={{
                    margin:
                      "4px 0",
                  }}
                >
                  <strong>
                    Cliente:
                  </strong>{" "}
                  {
                    clienteSelecionado.nome
                  }
                </p>
              )}
            </div>

            <div
              style={{
                borderTop:
                  "1px solid #ddd",
                borderBottom:
                  "1px solid #ddd",
                padding:
                  "12px 0",
              }}
            >
              {itens.map(
                (item) => (
                  <div
                    key={
                      item.produtoId
                    }
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      gap: 12,
                      marginBottom: 10,
                      fontSize: 13,
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                      }}
                    >
                      <strong>
                        {
                          item.produtoNome
                        }
                      </strong>

                      <div
                        style={{
                          color:
                            "#666",
                          marginTop: 2,
                        }}
                      >
                        {
                          item.quantidade
                        }{" "}
                        x{" "}
                        {dinheiro(
                          item.precoUnitario
                        )}
                      </div>
                    </div>

                    <strong>
                      {dinheiro(
                        item.quantidade *
                          item.precoUnitario
                      )}
                    </strong>
                  </div>
                )
              )}
            </div>

            <div
              style={{
                marginTop: 16,
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                <span>
                  TOTAL
                </span>

                <span>
                  {dinheiro(
                    vendaFinalizada.total
                  )}
                </span>
              </div>

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  marginTop: 10,
                  fontSize: 14,
                }}
              >
                <span>
                  Pagamento
                </span>

                <strong>
                  {nomeFormaPagamento(
                    vendaFinalizada.formaPagamento
                  )}
                </strong>
              </div>

              {vendaFinalizada.formaPagamento ===
                "dinheiro" && (
                <>
                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      marginTop: 6,
                      fontSize: 14,
                    }}
                  >
                    <span>
                      Recebido
                    </span>

                    <strong>
                      {dinheiro(
                        valorRecebidoNumero
                      )}
                    </strong>
                  </div>

                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      marginTop: 6,
                      fontSize: 14,
                    }}
                  >
                    <span>
                      Troco
                    </span>

                    <strong>
                      {dinheiro(
                        troco
                      )}
                    </strong>
                  </div>
                </>
              )}
            </div>

            <div
              style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop:
                  "1px dashed #999",
                textAlign: "center",
                fontSize: 12,
                color: "#666",
              }}
            >
              Obrigado pela preferência!
              <br />
              Este é um comprovante não
              fiscal.
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 20,
              }}
            >
              <button
                type="button"
                onClick={() =>
                  window.print()
                }
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 6,
                  border:
                    "1px solid #ccc",
                  background: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Imprimir
              </button>

              <button
                type="button"
                onClick={
                  fecharComprovante
                }
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 6,
                  border: "none",
                  background:
                    "#2563eb",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Nova venda
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default PDV;