import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Tabela, { ColunaTabela } from "../components/Tabela";
import { Produto } from "../types/Produto";
import api from "../services/api";

/**
 * Estoque - consulta de níveis de estoque. Importa Header, Sidebar e Tabela.
 */
const Estoque: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);

  useEffect(() => {
    api.get("/estoque").then((resposta) => setProdutos(resposta.data));
  }, []);

  const colunas: ColunaTabela<Produto>[] = [
    { chave: "nome", titulo: "Produto" },
    {
      chave: "quantidadeEstoque",
      titulo: "Quantidade",
      render: (v) => (
        <span style={{ color: Number(v) <= 5 ? "#e5484d" : "#1c1f26", fontWeight: 600 }}>{v}</span>
      ),
    },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header nomeUsuario="Administrador" aoSair={() => {}} />
        <main style={{ padding: 24 }}>
          <h2>Estoque</h2>
          <Tabela colunas={colunas} dados={produtos} chaveLinha={(p) => p.id} />
        </main>
      </div>
    </div>
  );
};

export default Estoque;
