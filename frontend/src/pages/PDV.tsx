import React, { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Input from "../components/Input";
import Botao from "../components/Botao";
import Tabela, { ColunaTabela } from "../components/Tabela";
import { ItemVenda } from "../types/Venda";
import api from "../services/api";

/**
 * PDV - ponto de venda. Importa Header, Sidebar, Input, Botao e Tabela.
 */
const PDV: React.FC = () => {
  const [codigo, setCodigo] = useState("");
  const [itens, setItens] = useState<ItemVenda[]>([]);

  async function adicionarItem() {
    if (!codigo) return;
    const resposta = await api.get(`/produtos/codigo/${codigo}`);
    const produto = resposta.data;

    setItens((atual) => [
      ...atual,
      {
        produtoId: produto.id,
        produtoNome: produto.nome,
        quantidade: 1,
        precoUnitario: produto.precoVenda,
      },
    ]);
    setCodigo("");
  }

  async function finalizarVenda() {
    await api.post("/vendas", { itens, formaPagamento: "dinheiro" });
    setItens([]);
  }

  const colunas: ColunaTabela<ItemVenda>[] = [
    { chave: "produtoNome", titulo: "Produto" },
    { chave: "quantidade", titulo: "Qtd" },
    {
      chave: "precoUnitario",
      titulo: "Preço Unit.",
      render: (v) => `R$ ${Number(v).toFixed(2)}`,
    },
  ];

  const total = itens.reduce((soma, item) => soma + item.quantidade * item.precoUnitario, 0);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header nomeUsuario="Operador" aoSair={() => {}} />

        <main style={{ padding: 24 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <Input label="Código de barras" valor={codigo} aoAlterar={setCodigo} placeholder="Bipe ou digite o código" />
            </div>
            <Botao texto="Adicionar" onClick={adicionarItem} />
          </div>

          <div style={{ marginTop: 16 }}>
            <Tabela colunas={colunas} dados={itens} chaveLinha={(i) => i.produtoId} />
          </div>

          <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Total: R$ {total.toFixed(2)}</h3>
            <Botao texto="Finalizar Venda" variante="sucesso" onClick={finalizarVenda} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PDV;
