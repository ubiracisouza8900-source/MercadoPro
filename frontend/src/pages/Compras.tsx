import React, { useEffect, useState } from "react";
import Tabela, { ColunaTabela } from "../components/Tabela";
import Botao from "../components/Botao";
import api from "../services/api";

interface Fornecedor {
  fornecedor_id: number;
  nome: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  produtos_fornecidos?: string;
}

interface Compra {
  compra_id: number;
  fornecedor_id: number;
  fornecedor_nome?: string;
  fornecedor_cnpj?: string;
  usuario_id: number;
  total: number;
  data_compra: string;
  data_vencimento: string | null;
  boleto_arquivo: string | null;
}

const Compras: React.FC = () => {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [modoEdicao, setModoEdicao] =
    useState(false);

  const [compraEditando, setCompraEditando] =
    useState<number | null>(null);

  const [busca, setBusca] = useState("");

  const [fornecedorId, setFornecedorId] =
    useState("");

  const [valor, setValor] =
    useState("");

  const [dataCompra, setDataCompra] =
    useState("");

  const [dataVencimento, setDataVencimento] =
    useState("");

  const [boleto, setBoleto] =
    useState<File | null>(null);

  const [fornecedorSelecionado, setFornecedorSelecionado] =
    useState<Fornecedor | null>(null);

  const carregarDados = async () => {
    try {
      const [resCompras, resFornecedores] =
        await Promise.all([
          api.get<Compra[]>("/compras"),
          api.get<Fornecedor[]>("/fornecedores"),
        ]);

      setCompras(resCompras.data);
      setFornecedores(resFornecedores.data);
    } catch (erro) {
      console.error(
        "Erro ao carregar compras:",
        erro
      );
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const selecionarFornecedor = (
    id: string
  ) => {
    setFornecedorId(id);

    const fornecedor =
      fornecedores.find(
        (item) =>
          item.fornecedor_id === Number(id)
      );

    setFornecedorSelecionado(
      fornecedor ?? null
    );
  };

  const limparFormulario = () => {
    setFornecedorId("");
    setFornecedorSelecionado(null);
    setValor("");
    setDataCompra("");
    setDataVencimento("");
    setBoleto(null);
    setModoEdicao(false);
    setCompraEditando(null);
  };

  const abrirNovaCompra = () => {
    limparFormulario();
    setMostrarFormulario(true);
  };

  const abrirEdicao = (
    compra: Compra
  ) => {
    setModoEdicao(true);
    setCompraEditando(
      compra.compra_id
    );

    setFornecedorId(
      String(compra.fornecedor_id)
    );

    const fornecedor =
      fornecedores.find(
        (item) =>
          item.fornecedor_id ===
          compra.fornecedor_id
      );

    setFornecedorSelecionado(
      fornecedor ?? null
    );

    setValor(
      String(compra.total)
    );

    setDataCompra(
      compra.data_compra
        ? compra.data_compra.substring(
            0,
            10
          )
        : ""
    );

    setDataVencimento(
      compra.data_vencimento
        ? compra.data_vencimento.substring(
            0,
            10
          )
        : ""
    );

    setBoleto(null);
    setMostrarFormulario(true);
  };

  const cancelar = () => {
    limparFormulario();
    setMostrarFormulario(false);
  };

  const salvarCompra = async (
    evento: React.FormEvent
  ) => {
    evento.preventDefault();

    if (!fornecedorId) {
      alert(
        "Selecione um fornecedor."
      );
      return;
    }

    if (!valor) {
      alert(
        "Informe o valor da compra."
      );
      return;
    }

    if (!dataCompra) {
      alert(
        "Informe a data da compra."
      );
      return;
    }

    if (!dataVencimento) {
      alert(
        "Informe a data de vencimento."
      );
      return;
    }

    if (
      !modoEdicao &&
      !boleto
    ) {
      alert(
        "Selecione o boleto em PDF."
      );
      return;
    }

    if (
      boleto &&
      boleto.type !==
        "application/pdf"
    ) {
      alert(
        "O boleto precisa estar no formato PDF."
      );
      return;
    }

    try {
      const formulario =
        new FormData();

      formulario.append(
        "fornecedorId",
        fornecedorId
      );

      formulario.append(
        "total",
        valor
      );

      formulario.append(
        "dataCompra",
        dataCompra
      );

      formulario.append(
        "dataVencimento",
        dataVencimento
      );

      if (boleto) {
        formulario.append(
          "boleto",
          boleto
        );
      }

      if (
        modoEdicao &&
        compraEditando
      ) {
        await api.put(
          `/compras/${compraEditando}`,
          formulario
        );

        alert(
          "Compra atualizada com sucesso!"
        );
      } else {
        await api.post(
          "/compras",
          formulario
        );

        alert(
          "Compra cadastrada com sucesso!"
        );
      }

      limparFormulario();
      setMostrarFormulario(false);

      await carregarDados();
    } catch (erro) {
      console.error(
        "Erro ao salvar compra:",
        erro
      );

      alert(
        modoEdicao
          ? "Não foi possível atualizar a compra."
          : "Não foi possível cadastrar a compra."
      );
    }
  };

  const excluirCompra = async (
    compraId: number
  ) => {
    const confirmar =
      window.confirm(
        "Tem certeza que deseja excluir esta compra?"
      );

    if (!confirmar) {
      return;
    }

    try {
      await api.delete(
        `/compras/${compraId}`
      );

      alert(
        "Compra excluída com sucesso!"
      );

      await carregarDados();
    } catch (erro) {
      console.error(
        "Erro ao excluir compra:",
        erro
      );

      alert(
        "Não foi possível excluir a compra."
      );
    }
  };

  const visualizarBoleto = async (
    compraId: number
  ) => {
    try {
      const resposta =
        await api.get(
          `/compras/${compraId}/boleto`,
          {
            responseType: "blob",
          }
        );

      const arquivo =
        new Blob(
          [resposta.data],
          {
            type: "application/pdf",
          }
        );

      const url =
        window.URL.createObjectURL(
          arquivo
        );

      window.open(
        url,
        "_blank"
      );

      setTimeout(() => {
        window.URL.revokeObjectURL(
          url
        );
      }, 60000);
    } catch (erro) {
      console.error(
        "Erro ao visualizar boleto:",
        erro
      );

      alert(
        "Não foi possível abrir o PDF."
      );
    }
  };

  const comprasFiltradas =
    compras.filter((compra) => {
      const nome =
        compra.fornecedor_nome
          ?.toLowerCase() ?? "";

      const cnpj =
        compra.fornecedor_cnpj
          ?.toLowerCase() ?? "";

      const termo =
        busca.toLowerCase();

      return (
        nome.includes(termo) ||
        cnpj.includes(termo)
      );
    });

  const colunas: ColunaTabela<Compra>[] = [
    {
      chave: "fornecedor_nome",
      titulo: "Fornecedor",
    },
    {
      chave: "fornecedor_cnpj",
      titulo: "CNPJ",
    },
    {
      chave: "total",
      titulo: "Valor",
      render: (valor) =>
        `R$ ${Number(valor).toFixed(2)}`,
    },
    {
      chave: "data_compra",
      titulo: "Data da Compra",
      render: (valor) =>
        new Date(
          valor
        ).toLocaleDateString(
          "pt-BR"
        ),
    },
    {
      chave: "data_vencimento",
      titulo: "Vencimento",
      render: (valor) =>
        valor
          ? new Date(
              valor
            ).toLocaleDateString(
              "pt-BR"
            )
          : "-",
    },
    {
      chave: "boleto_arquivo",
      titulo: "Boleto",
      render: (valor, compra) =>
        valor ? (
          <button
            type="button"
            onClick={() =>
              visualizarBoleto(
                compra.compra_id
              )
            }
          >
            📄 Visualizar PDF
          </button>
        ) : (
          "-"
        ),
    },
    {
      chave: "compra_id",
      titulo: "Ações",
      render: (_valor, compra) => (
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() =>
              abrirEdicao(compra)
            }
          >
            ✏️ Editar
          </button>

          <button
            type="button"
            onClick={() =>
              excluirCompra(
                compra.compra_id
              )
            }
          >
            🗑️ Excluir
          </button>
        </div>
      ),
    },
  ];

  return (
    <main style={{ padding: 24 }}>
      {!mostrarFormulario && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginBottom: 20,
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <h2>Compras</h2>

            <Botao
              texto="Nova Compra"
              onClick={
                abrirNovaCompra
              }
            />
          </div>

          <div
            style={{
              marginBottom: 20,
            }}
          >
            <input
              type="text"
              placeholder="Buscar por fornecedor ou CNPJ"
              value={busca}
              onChange={(evento) =>
                setBusca(
                  evento.target.value
                )
              }
              style={{
                width: "100%",
                maxWidth: 500,
                padding: 10,
                border:
                  "1px solid #ccc",
                borderRadius: 6,
              }}
            />
          </div>

          <Tabela
            colunas={colunas}
            dados={comprasFiltradas}
            chaveLinha={(compra) =>
              String(
                compra.compra_id
              )
            }
          />
        </>
      )}

      {mostrarFormulario && (
        <form
          onSubmit={salvarCompra}
          style={{
            maxWidth: 900,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <h2>
              {modoEdicao
                ? "Editar Compra"
                : "Nova Compra"}
            </h2>

            <Botao
              texto="Cancelar"
              variante="secundario"
              onClick={cancelar}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 16,
            }}
          >
            <div>
              <label>
                Fornecedor
              </label>

              <select
                value={fornecedorId}
                onChange={(evento) =>
                  selecionarFornecedor(
                    evento.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: 10,
                  marginTop: 6,
                }}
              >
                <option value="">
                  Selecione o fornecedor
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
                      {fornecedor.cnpj
                        ? ` - ${fornecedor.cnpj}`
                        : ""}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label>CNPJ</label>

              <input
                type="text"
                value={
                  fornecedorSelecionado
                    ?.cnpj ?? ""
                }
                readOnly
                style={{
                  width: "100%",
                  padding: 10,
                  marginTop: 6,
                  background:
                    "#f3f4f6",
                }}
              />
            </div>

            <div>
              <label>
                Telefone
              </label>

              <input
                type="text"
                value={
                  fornecedorSelecionado
                    ?.telefone ?? ""
                }
                readOnly
                style={{
                  width: "100%",
                  padding: 10,
                  marginTop: 6,
                  background:
                    "#f3f4f6",
                }}
              />
            </div>

            <div>
              <label>
                E-mail
              </label>

              <input
                type="text"
                value={
                  fornecedorSelecionado
                    ?.email ?? ""
                }
                readOnly
                style={{
                  width: "100%",
                  padding: 10,
                  marginTop: 6,
                  background:
                    "#f3f4f6",
                }}
              />
            </div>

            <div>
              <label>
                Endereço
              </label>

              <input
                type="text"
                value={
                  fornecedorSelecionado
                    ?.endereco ?? ""
                }
                readOnly
                style={{
                  width: "100%",
                  padding: 10,
                  marginTop: 6,
                  background:
                    "#f3f4f6",
                }}
              />
            </div>

            <div>
              <label>
                Produtos fornecidos
              </label>

              <input
                type="text"
                value={
                  fornecedorSelecionado
                    ?.produtos_fornecidos ??
                  ""
                }
                readOnly
                style={{
                  width: "100%",
                  padding: 10,
                  marginTop: 6,
                  background:
                    "#f3f4f6",
                }}
              />
            </div>

            <div>
              <label>
                Valor da compra
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                value={valor}
                onChange={(evento) =>
                  setValor(
                    evento.target.value
                  )
                }
                placeholder="0,00"
                style={{
                  width: "100%",
                  padding: 10,
                  marginTop: 6,
                }}
              />
            </div>

            <div>
              <label>
                Data da compra
              </label>

              <input
                type="date"
                value={dataCompra}
                onChange={(evento) =>
                  setDataCompra(
                    evento.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: 10,
                  marginTop: 6,
                }}
              />
            </div>

            <div>
              <label>
                Data de vencimento
              </label>

              <input
                type="date"
                value={
                  dataVencimento
                }
                onChange={(evento) =>
                  setDataVencimento(
                    evento.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: 10,
                  marginTop: 6,
                }}
              />
            </div>

            <div>
              <label>
                {modoEdicao
                  ? "Novo boleto em PDF (opcional)"
                  : "Boleto em PDF"}
              </label>

              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={(evento) => {
                  const arquivo =
                    evento.target
                      .files?.[0] ??
                    null;

                  setBoleto(arquivo);
                }}
                style={{
                  width: "100%",
                  marginTop: 10,
                }}
              />

              {modoEdicao && (
                <small
                  style={{
                    display:
                      "block",
                    marginTop: 8,
                    color: "#666",
                  }}
                >
                  Se não selecionar
                  outro PDF, o boleto
                  atual será mantido.
                </small>
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 28,
            }}
          >
            <button type="submit">
              {modoEdicao
                ? "Salvar Alterações"
                : "Salvar Compra"}
            </button>

            <Botao
              texto="Cancelar"
              variante="secundario"
              onClick={cancelar}
            />
          </div>
        </form>
      )}
    </main>
  );
};

export default Compras;