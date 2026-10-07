import React, { useEffect, useState } from "react";
import Tabela, { ColunaTabela } from "../components/Tabela";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Botao from "../components/Botao";
import { Produto } from "../types/Produto";
import api from "../services/api";

interface Categoria {
  categoriaId: number;
  nome: string;
}

interface ErroApi {
  response?: {
    data?: {
      mensagem?: string;
      message?: string;
    };
  };
}

function obterMensagemErro(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const erroApi = error as ErroApi;

    return (
      erroApi.response?.data?.mensagem ||
      erroApi.response?.data?.message ||
      "Erro interno no servidor."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Erro interno no servidor.";
}

const Produtos: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] =
    useState<number | null>(null);

  const [nome, setNome] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");
  const [precoCusto, setPrecoCusto] = useState("");
  const [precoVenda, setPrecoVenda] = useState("");
  const [quantidadeEstoque, setQuantidadeEstoque] =
    useState("");
  const [estoqueMinimo, setEstoqueMinimo] =
    useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const [produtosResposta, categoriasResposta] =
        await Promise.all([
          api.get<Produto[]>("/produtos"),
          api.get<Categoria[]>("/categorias"),
        ]);

      setProdutos(produtosResposta.data);
      setCategorias(categoriasResposta.data);
    } catch (error: unknown) {
      console.error(
        "Erro ao carregar produtos e categorias:",
        error
      );

      alert(obterMensagemErro(error));
    }
  }

  function limparFormulario() {
    setProdutoEditando(null);
    setNome("");
    setCategoriaId("");
    setCodigoBarras("");
    setPrecoCusto("");
    setPrecoVenda("");
    setQuantidadeEstoque("");
    setEstoqueMinimo("");
  }

  function editarProduto(produto: Produto) {
    setProdutoEditando(produto.produtoId);

    setNome(produto.nome);

    setCategoriaId(
      produto.categoriaId !== null
        ? String(produto.categoriaId)
        : ""
    );

    setCodigoBarras(
      produto.codigoBarras ?? ""
    );

    setPrecoCusto(
      String(produto.precoCusto ?? "")
    );

    setPrecoVenda(
      String(produto.precoVenda ?? "")
    );

    setQuantidadeEstoque(
      String(produto.quantidadeEstoque ?? "")
    );

    setEstoqueMinimo(
      String(produto.estoqueMinimo ?? "")
    );

    setModalAberto(true);
  }

  async function salvarProduto() {
    if (!nome.trim()) {
      alert("Informe o nome do produto.");
      return;
    }

    if (!precoVenda) {
      alert("Informe o preço de venda.");
      return;
    }

    const dadosProduto = {
      nome: nome.trim(),

      categoriaId: categoriaId
        ? Number(categoriaId)
        : null,

      codigoBarras:
        codigoBarras.trim() || null,

      precoCusto:
        Number(precoCusto || 0),

      precoVenda:
        Number(precoVenda),

      quantidadeEstoque:
        Number(quantidadeEstoque || 0),

      estoqueMinimo:
        Number(estoqueMinimo || 0),
    };

    try {
      if (produtoEditando !== null) {
        await api.put(
          `/produtos/${produtoEditando}`,
          dadosProduto
        );

        alert(
          "Produto atualizado com sucesso!"
        );
      } else {
        await api.post(
          "/produtos",
          dadosProduto
        );

        alert(
          "Produto cadastrado com sucesso!"
        );
      }

      await carregarDados();

      setModalAberto(false);
      limparFormulario();
    } catch (error: unknown) {
      console.error(
        "Erro ao salvar produto:",
        error
      );

      const mensagem =
        obterMensagemErro(error);

      alert(
        `Não foi possível salvar: ${mensagem}`
      );
    }
  }

  async function excluirProduto(produto: Produto) {
    const confirmar = window.confirm(
      `Deseja realmente excluir o produto "${produto.nome}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      await api.delete(
        `/produtos/${produto.produtoId}`
      );

      await carregarDados();

      alert(
        "Produto excluído com sucesso!"
      );
    } catch (error: unknown) {
      console.error(
        "Erro ao excluir produto:",
        error
      );

      const mensagem =
        obterMensagemErro(error);

      alert(
        `Não foi possível excluir: ${mensagem}`
      );
    }
  }

  const colunas: ColunaTabela<Produto>[] = [
    {
      chave: "nome",
      titulo: "Nome",
    },

    {
      chave: "categoriaNome",
      titulo: "Categoria",
    },

    {
      chave: "codigoBarras",
      titulo: "Código de barras",
    },

    {
      chave: "precoVenda",
      titulo: "Preço",
      render: (valor) =>
        `R$ ${Number(
          valor ?? 0
        ).toFixed(2)}`,
    },

    {
      chave: "quantidadeEstoque",
      titulo: "Estoque",
    },

    {
      chave: "produtoId",
      titulo: "Ações",
      render: (_, produto) => (
        <div
          style={{
            display: "flex",
            gap: 8,
          }}
        >
          <button
            type="button"
            onClick={() =>
              editarProduto(produto)
            }
            style={{
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            ✏️ Editar
          </button>

          <button
            type="button"
            onClick={() =>
              excluirProduto(produto)
            }
            style={{
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            🗑️ Excluir
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: 1 }}>
        <main style={{ padding: 24 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <h2>Produtos</h2>

            <Botao
              texto="Novo Produto"
              onClick={() => {
                limparFormulario();
                setModalAberto(true);
              }}
            />
          </div>

          <Tabela
            colunas={colunas}
            dados={produtos}
            chaveLinha={(produto) =>
              String(produto.produtoId)
            }
          />
        </main>
      </div>

      <Modal
        aberto={modalAberto}
        titulo={
          produtoEditando !== null
            ? "Editar Produto"
            : "Novo Produto"
        }
        aoFechar={() => {
          setModalAberto(false);
          limparFormulario();
        }}
        aoConfirmar={salvarProduto}
        textoConfirmar={
          produtoEditando !== null
            ? "Atualizar"
            : "Salvar"
        }
      >
        <Input
          label="Nome"
          valor={nome}
          aoAlterar={setNome}
        />

        <div
          style={{
            marginBottom: 16,
          }}
        >
          <label>Categoria</label>

          <select
            value={categoriaId}
            onChange={(e) =>
              setCategoriaId(
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
              Sem categoria
            </option>

            {categorias.map(
              (categoria) => (
                <option
                  key={
                    categoria.categoriaId
                  }
                  value={
                    categoria.categoriaId
                  }
                >
                  {categoria.nome}
                </option>
              )
            )}
          </select>
        </div>

        <Input
          label="Código de barras"
          valor={codigoBarras}
          aoAlterar={setCodigoBarras}
        />

        <Input
          label="Preço de custo"
          tipo="number"
          valor={precoCusto}
          aoAlterar={setPrecoCusto}
        />

        <Input
          label="Preço de venda"
          tipo="number"
          valor={precoVenda}
          aoAlterar={setPrecoVenda}
        />

        <Input
          label="Quantidade em estoque"
          tipo="number"
          valor={quantidadeEstoque}
          aoAlterar={setQuantidadeEstoque}
        />

        <Input
          label="Estoque mínimo"
          tipo="number"
          valor={estoqueMinimo}
          aoAlterar={setEstoqueMinimo}
        />
      </Modal>
    </div>
  );
};

export default Produtos;