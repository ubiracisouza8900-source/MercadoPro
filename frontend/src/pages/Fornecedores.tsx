import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Tabela, { ColunaTabela } from "../components/Tabela";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Botao from "../components/Botao";
import api from "../services/api";

interface Fornecedor {
  id: number;
  nome: string;
  cnpj?: string;
  telefone?: string;
}

/**
 * Fornecedores - CRUD. Importa Header, Sidebar, Tabela, Modal, Input e Botao.
 */
const Fornecedores: React.FC = () => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");

  async function carregar() {
    const resposta = await api.get("/fornecedores");
    setFornecedores(resposta.data);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function salvar() {
    await api.post("/fornecedores", { nome, cnpj });
    setModalAberto(false);
    setNome("");
    setCnpj("");
    carregar();
  }

  const colunas: ColunaTabela<Fornecedor>[] = [
    { chave: "nome", titulo: "Nome" },
    { chave: "cnpj", titulo: "CNPJ" },
    { chave: "telefone", titulo: "Telefone" },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header nomeUsuario="Administrador" aoSair={() => {}} />
        <main style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <h2>Fornecedores</h2>
            <Botao texto="Novo Fornecedor" onClick={() => setModalAberto(true)} />
          </div>
          <Tabela colunas={colunas} dados={fornecedores} chaveLinha={(f) => f.id} />
        </main>
      </div>

      <Modal aberto={modalAberto} titulo="Novo Fornecedor" aoFechar={() => setModalAberto(false)} aoConfirmar={salvar}>
        <Input label="Nome" valor={nome} aoAlterar={setNome} />
        <Input label="CNPJ" valor={cnpj} aoAlterar={setCnpj} />
      </Modal>
    </div>
  );
};

export default Fornecedores;
