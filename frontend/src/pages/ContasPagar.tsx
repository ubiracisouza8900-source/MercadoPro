import React, { useEffect, useState } from "react";
import Tabela, { ColunaTabela } from "../components/Tabela";
import Botao from "../components/Botao";
import api from "../services/api";

interface ContaPagar {
  id: number;
  descricao: string;
  valor: number;
  vencimento: string;
  paga: boolean;
}

const ContasPagar: React.FC = () => {
  const [contas, setContas] = useState<ContaPagar[]>([]);

  async function carregar() {
    const resposta = await api.get("/contas-pagar");
    setContas(resposta.data);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function marcarComoPaga(id: number) {
    await api.put(`/contas-pagar/${id}/pagar`);
    carregar();
  }

  const colunas: ColunaTabela<ContaPagar>[] = [
    {
      chave: "descricao",
      titulo: "Descrição",
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
      chave: "paga",
      titulo: "Situação",
      render: (v, linha) =>
        v ? (
          "Paga"
        ) : (
          <Botao
            texto="Marcar como paga"
            variante="secundario"
            onClick={() => marcarComoPaga(linha.id)}
          />
        ),
    },
  ];

  return (
    <main style={{ padding: 24 }}>
      <h2>Contas a Pagar</h2>

      <Tabela
        colunas={colunas}
        dados={contas}
        chaveLinha={(c) => String(c.id)}
      />
    </main>
  );
};

export default ContasPagar;