import React, { useEffect, useState } from "react";
import Botao from "../components/Botao";
import api from "../services/api";

interface ResumoCaixa {
  status: "aberto" | "fechado";
  saldoInicial: number;
  totalVendas: number;
}

const Caixa: React.FC = () => {
  const [resumo, setResumo] = useState<ResumoCaixa | null>(null);

  async function carregar() {
    const resposta = await api.get("/caixa/atual");
    setResumo(resposta.data);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function abrirCaixa() {
    await api.post("/caixa/abrir", {
      saldoInicial: 100,
    });

    carregar();
  }

  async function fecharCaixa() {
    await api.post("/caixa/fechar");
    carregar();
  }

  return (
    <main style={{ padding: 24 }}>
      <h2>Caixa</h2>

      {resumo ? (
        <>
          <p>
            Status: <strong>{resumo.status}</strong>
          </p>

          <p>
            Saldo inicial: R$ {resumo.saldoInicial.toFixed(2)}
          </p>

          <p>
            Total de vendas: R$ {resumo.totalVendas.toFixed(2)}
          </p>

          {resumo.status === "aberto" ? (
            <Botao
              texto="Fechar Caixa"
              variante="perigo"
              onClick={fecharCaixa}
            />
          ) : (
            <Botao
              texto="Abrir Caixa"
              variante="sucesso"
              onClick={abrirCaixa}
            />
          )}
        </>
      ) : (
        <p>Carregando...</p>
      )}
    </main>
  );
};

export default Caixa;