import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Tabela, { ColunaTabela } from "../components/Tabela";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Botao from "../components/Botao";
import api from "../services/api";

interface Categoria {
  id: number;
  nome: string;
}

/**
 * Categorias - CRUD simples. Importa Header, Sidebar, Tabela, Modal, Input e Botao.
 */
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

  const colunas: ColunaTabela<Categoria>[] = [{ chave: "nome", titulo: "Nome" }];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header nomeUsuario="Administrador" aoSair={() => {}} />
        <main style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <h2>Categorias</h2>
            <Botao texto="Nova Categoria" onClick={() => setModalAberto(true)} />
          </div>
          <Tabela colunas={colunas} dados={categorias} chaveLinha={(c) => c.id} />
        </main>
      </div>

      <Modal aberto={modalAberto} titulo="Nova Categoria" aoFechar={() => setModalAberto(false)} aoConfirmar={salvar}>
        <Input label="Nome" valor={nome} aoAlterar={setNome} />
      </Modal>
    </div>
  );
};

export default Categorias;
