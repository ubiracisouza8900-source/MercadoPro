import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Tabela, { ColunaTabela } from "../components/Tabela";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Botao from "../components/Botao";
import { Cliente } from "../types/Cliente";
import api from "../services/api";

/**
 * Clientes - CRUD. Importa Header, Sidebar, Tabela, Modal, Input e Botao.
 */
const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");

  async function carregar() {
    const resposta = await api.get("/clientes");
    setClientes(resposta.data);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function salvar() {
    await api.post("/clientes", { nome, telefone });
    setModalAberto(false);
    setNome("");
    setTelefone("");
    carregar();
  }

  const colunas: ColunaTabela<Cliente>[] = [
    { chave: "nome", titulo: "Nome" },
    { chave: "telefone", titulo: "Telefone" },
    { chave: "email", titulo: "E-mail" },
  ];

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header nomeUsuario="Administrador" aoSair={() => {}} />
        <main style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <h2>Clientes</h2>
            <Botao texto="Novo Cliente" onClick={() => setModalAberto(true)} />
          </div>
          <Tabela colunas={colunas} dados={clientes} chaveLinha={(c) => c.id} />
        </main>
      </div>

      <Modal aberto={modalAberto} titulo="Novo Cliente" aoFechar={() => setModalAberto(false)} aoConfirmar={salvar}>
        <Input label="Nome" valor={nome} aoAlterar={setNome} />
        <Input label="Telefone" valor={telefone} aoAlterar={setTelefone} />
      </Modal>
    </div>
  );
};

export default Clientes;
