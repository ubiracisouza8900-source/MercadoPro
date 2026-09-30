import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Tabela, { ColunaTabela } from "../components/Tabela";
import Botao from "../components/Botao";
import api from "../services/api";

interface ContaReceber {
  id: number;
  clienteNome: string;
  valor: number;
  vencimento: string;
  recebida: boolean;
}

/**
 * ContasReceber - listagem financeira. Importa Header, Sidebar, Tabela e Botao.
 */
const ContasReceber: React.FC = () => {
  const [contas, setContas] = useState<ContaReceber[]>([]);

  async function carregar() {
    const resposta = await api.get("/contas-receber");
    setContas(resposta.data);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function marcarComoRecebida(id: number) {
    await api.put(`/contas-receber/${id}/receber`);
    carregar();
  }

  const colunas: ColunaTabela<ContaReceber>[] = [
    { chave: "clienteNome", titulo: "Cliente" },
    { chave: "valor", titulo: "Valor", render: (v) => `R$ ${Number(v).toFixed(2)}` },
    { chave: "vencimento", titulo: "Vencimento" },
    {
      chave: "recebida",
      titulo: "Situação",
      render: (v, linha) =>
        v ? "Recebida" : <Botao texto="Marcar como recebida" variante="secundario" onClick={() => marcarComoRecebida(linha.id)} />,
    },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header nomeUsuario="Financeiro" aoSair={() => {}} />
        <main style={{ padding: 24 }}>
          <h2>Contas a Receber</h2>
          <Tabela colunas={colunas} dados={contas} chaveLinha={(c) => c.id} />
        </main>
      </div>
    </div>
  );
};

export default ContasReceber;
