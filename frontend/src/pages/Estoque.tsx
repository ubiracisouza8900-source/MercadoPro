
import React, { useEffect, useState } from "react";
import Tabela, { ColunaTabela } from "../components/Tabela";
import { Produto } from "../types/Produto";
import api from "../services/api";
import styles from "./Estoque.module.css";

const Estoque: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pesquisa, setPesquisa] = useState("");

  useEffect(() => {
    api.get("/estoque").then((resposta) => setProdutos(resposta.data));
  }, []);

  const produtosFiltrados = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(pesquisa.toLowerCase())
  );

  const colunas: ColunaTabela<Produto>[] = [
    {
      chave: "nome",
      titulo: "Produto",
    },
    {
      chave: "quantidadeEstoque",
      titulo: "Quantidade",
      render: (v) => (
        <span
          className={
            Number(v) <= 5
              ? styles.quantidadeBaixa
              : styles.quantidadeNormal
          }
        >
          {v}
        </span>
      ),
    },
  ];

  return (
    <main className={styles.pagina}>
      <h2 className={styles.titulo}>Estoque</h2>

      <input
        type="text"
        className={styles.pesquisa}
        placeholder="Pesquisar produto..."
        value={pesquisa}
        onChange={(e) => setPesquisa(e.target.value)}
      />

      <div className={styles.tabelaResponsiva}>
        <Tabela
          colunas={colunas}
          dados={produtosFiltrados}
          chaveLinha={(p) => String(p.produtoId)}
        />
      </div>
    </main>
  );
};

export default Estoque;