import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import CardAtalho from "../components/CardAtalho";

/**
 * Dashboard - tela inicial pós-login. Importa Header, Sidebar e CardAtalho.
 */
const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  function sair() {
    localStorage.removeItem("mercadopro_token");
    navigate("/login");
  }

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header nomeUsuario="Administrador" aoSair={sair} />

        <main style={{ padding: 24, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <CardAtalho titulo="Nova Venda" descricao="Abrir o PDV" icone="🧾" aoClicar={() => navigate("/pdv")} />
          <CardAtalho titulo="Produtos" descricao="Gerenciar catálogo" icone="📦" aoClicar={() => navigate("/produtos")} />
          <CardAtalho titulo="Estoque" descricao="Consultar níveis" icone="📊" aoClicar={() => navigate("/estoque")} />
          <CardAtalho titulo="Relatórios" descricao="Ver desempenho" icone="📈" aoClicar={() => navigate("/relatorios")} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
