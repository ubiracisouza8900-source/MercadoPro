import React, { useEffect, useState } from "react";
import Tabela, { ColunaTabela } from "../components/Tabela";
import { Produto } from "../types/Produto";
import api from "../services/api";

const Estoque: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pesquisa, setPesquisa] = useState("");

  useEffect(() => {
    api.get("/estoque").then((resposta) => setProdutos(resposta.data));
  }, []);

  const produtosFiltrados = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(pesquisa.toLowerCase())
  );

  const colunas: ColunaTabela<Produto>[] = [
    {
      chave: "nome",
      titulo: "Produto",
    },
    {
      chave: "quantidadeEstoque",
      titulo: "Quantidade",
      render: (v) => (
        <span
          style={{
            color: Number(v) <= 5 ? "#e5484d" : "#1c1f26",
            fontWeight: 600,
          }}
        >
          {v}
        </span>
      ),
    },
  ];

  return (
    <main style={{ padding: 24 }}>
      <h2>Estoque</h2>

      <input
        type="text"
        placeholder="Pesquisar produto..."
        value={pesquisa}
        onChange={(e) => setPesquisa(e.target.value)}
        style={{
          width: "100%",
          maxWidth: 400,
          padding: "10px 12px",
          marginBottom: 20,
          border: "1px solid #d1d5db",
          borderRadius: 6,
          fontSize: 14,
          outline: "none",
        }}
      />

      <Tabela
        colunas={colunas}
        dados={produtosFiltrados}
        chaveLinha={(p) => String(p.produtoId)}
      />
    </main>
  );
};

export default Estoque;