import React, { useEffect, useState } from "react";
import Tabela, { ColunaTabela } from "../components/Tabela";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Botao from "../components/Botao";
import { Cliente } from "../types/Cliente";
import api from "../services/api";

const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<number | null>(null);

  const [pesquisa, setPesquisa] = useState("");

  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [endereco, setEndereco] = useState("");
  const [nr, setNr] = useState("");
  const [bairro, setBairro] = useState("");
  const [valorAPagar, setValorAPagar] = useState("");

  async function carregar() {
    try {
      const resposta = await api.get("/clientes");
      setClientes(resposta.data);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      alert("Não foi possível carregar os clientes.");
    }
  }

useEffect(() => {
  let ativo = true;

  async function carregarClientes() {
    try {
      const resposta = await api.get("/clientes");

      if (ativo) {
        setClientes(resposta.data);
      }
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      alert("Não foi possível carregar os clientes.");
    }
  }

  carregarClientes();

  return () => {
    ativo = false;
  };
}, []);

  function limparFormulario() {
    setNome("");
    setDocumento("");
    setTelefone("");
    setEmail("");
    setEndereco("");
    setNr("");
    setBairro("");
    setValorAPagar("");
    setClienteEditando(null);
  }

  function abrirNovoCliente() {
    limparFormulario();
    setModalAberto(true);
  }

  function editarCliente(cliente: Cliente) {
    setClienteEditando(cliente.cliente_id);

    setNome(cliente.nome);
    setDocumento(cliente.documento ?? "");
    setTelefone(cliente.telefone ?? "");
    setEmail(cliente.email ?? "");
    setEndereco(cliente.endereco ?? "");
    setNr(cliente.nr !== undefined ? String(cliente.nr) : "");
    setBairro(cliente.bairro !== undefined ? String(cliente.bairro) : "");
    setValorAPagar(
      cliente.valor_a_pagar !== undefined
        ? String(cliente.valor_a_pagar)
        : ""
    );

    setModalAberto(true);
  }

  async function salvar() {
    if (!nome.trim()) {
      alert("Informe o nome do cliente.");
      return;
    }

    try {
      const dados = {
        nome: nome.trim(),
        documento: documento.trim() || null,
        telefone: telefone.trim() || null,
        email: email.trim() || null,
        endereco: endereco.trim() || null,
        nr: nr.trim() ? Number(nr) : null,
        bairro: bairro.trim() || null,
        valor_a_pagar: valorAPagar.trim()
          ? Number(valorAPagar.replace(",", "."))
          : 0,
      };

      if (clienteEditando !== null) {
        await api.put(`/clientes/${clienteEditando}`, dados);
        alert("Cliente atualizado com sucesso!");
      } else {
        await api.post("/clientes", dados);
        alert("Cliente cadastrado com sucesso!");
      }

      await carregar();

      setModalAberto(false);
      limparFormulario();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      alert("Não foi possível salvar o cliente.");
    }
  }

  async function excluirCliente(cliente: Cliente) {
    const confirmar = window.confirm(
      `Deseja realmente excluir o cliente "${cliente.nome}"?`
    );

    if (!confirmar) return;

    try {
      await api.delete(`/clientes/${cliente.cliente_id}`);

      await carregar();

      alert("Cliente excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      alert("Não foi possível excluir o cliente.");
    }
  }

  const clientesFiltrados = clientes.filter((cliente) => {
    const termo = pesquisa.toLowerCase().trim();

    if (!termo) return true;

    return (
      cliente.nome?.toLowerCase().includes(termo) ||
      cliente.telefone?.toLowerCase().includes(termo) ||
      cliente.documento?.toLowerCase().includes(termo) ||
      cliente.email?.toLowerCase().includes(termo) ||
      cliente.endereco?.toLowerCase().includes(termo) ||
      String(cliente.nr ?? "").includes(termo) ||
      cliente.bairro?.toLowerCase().includes(termo) ||
      String(cliente.valor_a_pagar ?? "").includes(termo)
    );
  });

  const colunas: ColunaTabela<Cliente>[] = [
    {
      chave: "nome",
      titulo: "Nome",
    },
    {
      chave: "documento",
      titulo: "Documento",
    },
    {
      chave: "telefone",
      titulo: "Telefone",
    },
    {
      chave: "email",
      titulo: "E-mail",
    },
    {
      chave: "endereco",
      titulo: "Endereço",
    },
    {
      chave: "nr",
      titulo: "Nº",
    },
    {
      chave: "bairro",
      titulo: "Bairro",
    },
    {
      chave: "valor_a_pagar",
      titulo: "Valor a Pagar",
      render: (valor) =>
        `R$ ${Number(valor ?? 0).toFixed(2).replace(".", ",")}`,
    },
    {
      chave: "cliente_id",
      titulo: "Ações",
      render: (_valor, cliente) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Botao
            texto="Editar"
            variante="secundario"
            onClick={() => editarCliente(cliente)}
          />

          <Botao
            texto="Excluir"
            variante="perigo"
            onClick={() => excluirCliente(cliente)}
          />
        </div>
      ),
    },
  ];

  return (
    <main style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          gap: 16,
        }}
      >
        <h2>Clientes</h2>

        <Botao
          texto="Novo Cliente"
          onClick={abrirNovoCliente}
        />
      </div>

      <input
        type="text"
        placeholder="Pesquisar por nome, telefone, documento, endereço, bairro ou valor..."
        value={pesquisa}
        onChange={(e) => setPesquisa(e.target.value)}
        style={{
          width: "100%",
          maxWidth: 600,
          padding: "10px 12px",
          marginBottom: 20,
          border: "1px solid #d1d5db",
          borderRadius: 6,
          fontSize: 14,
          outline: "none",
        }}
      />

      <Tabela
        colunas={colunas}
        dados={clientesFiltrados}
        chaveLinha={(cliente) => String(cliente.cliente_id)}
      />

      <Modal
        aberto={modalAberto}
        titulo={
          clienteEditando !== null
            ? "Editar Cliente"
            : "Novo Cliente"
        }
        aoFechar={() => {
          setModalAberto(false);
          limparFormulario();
        }}
        aoConfirmar={salvar}
        textoConfirmar={
          clienteEditando !== null
            ? "Atualizar"
            : "Salvar"
        }
      >
        <Input
          label="Nome"
          valor={nome}
          aoAlterar={setNome}
        />

        <Input
          label="Documento"
          valor={documento}
          aoAlterar={setDocumento}
        />

        <Input
          label="Telefone"
          valor={telefone}
          aoAlterar={setTelefone}
        />

        <Input
          label="E-mail"
          tipo="email"
          valor={email}
          aoAlterar={setEmail}
        />

        <Input
          label="Endereço"
          valor={endereco}
          aoAlterar={setEndereco}
        />

        <Input
          label="Número"
          tipo="number"
          valor={nr}
          aoAlterar={setNr}
        />

        <Input
          label="Bairro"
          valor={bairro}
          aoAlterar={setBairro}
        />

        <Input
          label="Valor a Pagar"
          tipo="number"
          valor={valorAPagar}
          aoAlterar={setValorAPagar}
        />
      </Modal>
    </main>
  );
};

export default Clientes;