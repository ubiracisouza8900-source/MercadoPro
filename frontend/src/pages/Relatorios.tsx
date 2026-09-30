import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Botao from "../components/Botao";
import api from "../services/api";

/**
 * Relatorios - geração de relatórios de vendas/estoque. Importa Header, Sidebar e Botao.
 */
const Relatorios: React.FC = () => {
  const [totalVendas, setTotalVendas] = useState<number | null>(null);

  async function gerarRelatorioVendas() {
    const resposta = await api.get("/relatorios/vendas");
    setTotalVendas(resposta.data.total);
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header nomeUsuario="Administrador" aoSair={() => {}} />
        <main style={{ padding: 24 }}>
          <h2>Relatórios</h2>
          <Botao texto="Gerar relatório de vendas" onClick={gerarRelatorioVendas} />
          {totalVendas !== null && <p style={{ marginTop: 16 }}>Total vendido: R$ {totalVendas.toFixed(2)}</p>}
        </main>
      </div>
    </div>
  );
};

export default Relatorios;
