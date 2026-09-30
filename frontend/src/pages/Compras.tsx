import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Tabela, { ColunaTabela } from "../components/Tabela";
import Botao from "../components/Botao";
import api from "../services/api";

interface Compra {
  id: number;
  fornecedorNome: string;
  total: number;
  data: string;
}

/**
 * Compras - listagem de pedidos de compra. Importa Header, Sidebar, Tabela e Botao.
 */
const Compras: React.FC = () => {
  const [compras, setCompras] = useState<Compra[]>([]);

  useEffect(() => {
    api.get("/compras").then((resposta) => setCompras(resposta.data));
  }, []);

  const colunas: ColunaTabela<Compra>[] = [
    { chave: "fornecedorNome", titulo: "Fornecedor" },
    { chave: "total", titulo: "Total", render: (v) => `R$ ${Number(v).toFixed(2)}` },
    { chave: "data", titulo: "Data" },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header nomeUsuario="Administrador" aoSair={() => {}} />
        <main style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <h2>Compras</h2>
            <Botao texto="Nova Compra" onClick={() => {}} />
          </div>
          <Tabela colunas={colunas} dados={compras} chaveLinha={(c) => c.id} />
        </main>
      </div>
    </div>
  );
};

export default Compras;
