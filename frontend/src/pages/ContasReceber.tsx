import React, { useEffect, useState } from "react";
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
    {
      chave: "clienteNome",
      titulo: "Cliente",
    },
    {
      chave: "valor",
      titulo: "Valor",
      render: (v) => `R$ ${Number(v).toFixed(2)}`,
    },
    {
      chave: "vencimento",
      titulo: "Vencimento",
    },
    {
      chave: "recebida",
      titulo: "Situação",
      render: (v, linha) =>
        v ? (
          "Recebida"
        ) : (
          <Botao
            texto="Marcar como recebida"
            variante="secundario"
            onClick={() => marcarComoRecebida(linha.id)}
          />
        ),
    },
  ];

  return (
    <main style={{ padding: 24 }}>
      <h2>Contas a Receber</h2>

      <Tabela
        colunas={colunas}
        dados={contas}
        chaveLinha={(c) => String(c.id)}
      />
    </main>
  );
};

export default ContasReceber;