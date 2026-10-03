import React, { useState } from "react";
import Botao from "../components/Botao";
import api from "../services/api";

const Relatorios: React.FC = () => {
  const [totalVendas, setTotalVendas] = useState<number | null>(null);

  async function gerarRelatorioVendas() {
    const resposta = await api.get("/relatorios/vendas");
    setTotalVendas(resposta.data.total);
  }

  return (
    <main style={{ padding: 24 }}>
      <h2>Relatórios</h2>

      <Botao
        texto="Gerar relatório de vendas"
        onClick={gerarRelatorioVendas}
      />

      {totalVendas !== null && (
        <p style={{ marginTop: 16 }}>
          Total vendido: R$ {totalVendas.toFixed(2)}
        </p>
      )}
    </main>
  );
};

export default Relatorios;