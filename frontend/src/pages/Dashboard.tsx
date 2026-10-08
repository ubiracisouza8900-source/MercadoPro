import React from "react";
import { useNavigate } from "react-router-dom";
import CardAtalho from "../components/CardAtalho";
import styles from "./Dashboard.module.css";

/**
 * Dashboard - tela inicial pós-login. Importa Header, Sidebar e CardAtalho.
 */

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className={styles.container}>
      <CardAtalho
        titulo="Nova Venda"
        descricao="Abrir o PDV"
        icone="🧾"
        aoClicar={() => navigate("/pdv")}
      />

      <CardAtalho
        titulo="Produtos"
        descricao="Gerenciar catálogo"
        icone="📦"
        aoClicar={() => navigate("/produtos")}
      />

      <CardAtalho
        titulo="Estoque"
        descricao="Consultar níveis"
        icone="📊"
        aoClicar={() => navigate("/estoque")}
      />

      <CardAtalho
        titulo="Relatórios"
        descricao="Ver desempenho"
        icone="📈"
        aoClicar={() => navigate("/relatorios")}
      />
    </main>
  );
};

export default Dashboard;