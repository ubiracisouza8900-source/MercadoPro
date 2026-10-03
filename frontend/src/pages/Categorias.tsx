import React, { useEffect, useState } from "react";
import Tabela, { ColunaTabela } from "../components/Tabela";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Botao from "../components/Botao";
import api from "../services/api";

interface Categoria {
  categoriaId: number;
  nome: string;
}

const Categorias: React.FC = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [nome, setNome] = useState("");

  async function carregar() {
    const resposta = await api.get("/categorias");
    setCategorias(resposta.data);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function salvar() {
    await api.post("/categorias", { nome });
    setModalAberto(false);
    setNome("");
    carregar();
  }

  const colunas: ColunaTabela<Categoria>[] = [
    {
      chave: "nome",
      titulo: "Nome",
    },
  ];

  return (
    <main style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h2>Categorias</h2>

        <Botao
          texto="Nova Categoria"
          onClick={() => setModalAberto(true)}
        />
      </div>

      <Tabela
        colunas={colunas}
        dados={categorias}
        chaveLinha={(categoria) =>
          String(categoria.categoriaId)
        }
      />

      <Modal
        aberto={modalAberto}
        titulo="Nova Categoria"
        aoFechar={() => setModalAberto(false)}
        aoConfirmar={salvar}
      >
        <Input
          label="Nome"
          valor={nome}
          aoAlterar={setNome}
        />
      </Modal>
    </main>
  );
};

export default Categorias;