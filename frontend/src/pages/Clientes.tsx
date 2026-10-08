import React, { useEffect, useState } from "react";

import Botao from "../components/Botao";
import Input from "../components/Input";
import Modal from "../components/Modal";
import Tabela from "../components/Tabela";

import api from "../services/api";

import type { Cliente } from "../types/Cliente";

import styles from "./Clientes.module.css";

interface DadosCep {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteEditando, setClienteEditando] =
    useState<Cliente | null>(null);

  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");

  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [nr, setNr] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");

  const [buscandoCep, setBuscandoCep] = useState(false);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    carregarClientes();
  }, []);

  async function carregarClientes() {
    try {
      setCarregando(true);
      const resposta = await api.get("/clientes");
      setClientes(resposta.data);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setCarregando(false);
    }
  }

  function limparFormulario() {
    setNome("");
    setDocumento("");
    setTelefone("");
    setEmail("");
    setCep("");
    setEndereco("");
    setNr("");
    setBairro("");
    setCidade("");
    setUf("");
    setClienteEditando(null);
  }

  function abrirNovoCliente() {
    limparFormulario();
    setModalAberto(true);
  }

  function editarCliente(cliente: Cliente) {
    setClienteEditando(cliente);
    setNome(cliente.nome || "");
    setDocumento(cliente.documento || "");
    setTelefone(cliente.telefone || "");
    setEmail(cliente.email || "");
    setCep(cliente.cep || "");
    setEndereco(cliente.endereco || "");

    setNr(
      cliente.nr !== undefined && cliente.nr !== null
        ? String(cliente.nr)
        : ""
    );

    setBairro(cliente.bairro || "");
    setCidade(cliente.cidade || "");
    setUf(cliente.uf || "");
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    limparFormulario();
  }

  async function buscarCep() {
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      alert("Informe um CEP válido.");
      return;
    }

    try {
      setBuscandoCep(true);

      const resposta = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );

      const dados: DadosCep = await resposta.json();

      if (dados.erro) {
        alert("CEP não encontrado.");
        return;
      }

      setEndereco(dados.logradouro || "");
      setBairro(dados.bairro || "");
      setCidade(dados.localidade || "");
      setUf(dados.uf || "");
    } catch (error) {
      console.error("Erro ao consultar CEP:", error);
      alert("Não foi possível consultar o CEP.");
    } finally {
      setBuscandoCep(false);
    }
  }

  function alterarCep(valor: string) {
    const cepLimpo = valor.replace(/\D/g, "");

    if (cepLimpo.length <= 5) {
      setCep(cepLimpo);
      return;
    }

    setCep(`${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5, 8)}`);
  }

  async function salvar() {
    if (!nome.trim()) {
      alert("Informe o nome do cliente.");
      return;
    }

    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      alert("Informe um CEP válido.");
      return;
    }

    if (!nr.trim()) {
      alert("Informe o número do endereço.");
      return;
    }

    const dados = {
      nome: nome.trim(),
      documento: documento.trim() || null,
      telefone: telefone.trim() || null,
      email: email.trim() || null,
      cep: cepLimpo,
      endereco: endereco.trim() || null,
      nr: Number(nr),
      bairro: bairro.trim() || null,
      cidade: cidade.trim() || null,
      uf: uf.trim() || null,
    };

    try {
      setCarregando(true);

      if (clienteEditando) {
        await api.put(
          `/clientes/${clienteEditando.cliente_id}`,
          dados
        );
      } else {
        await api.post("/clientes", dados);
      }

      await carregarClientes();
      fecharModal();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      alert("Não foi possível salvar o cliente.");
    } finally {
      setCarregando(false);
    }
  }

  async function removerCliente(cliente: Cliente) {
    const confirmar = window.confirm(
      `Deseja realmente remover o cliente "${cliente.nome}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      await api.delete(`/clientes/${cliente.cliente_id}`);
      await carregarClientes();
    } catch (error) {
      console.error("Erro ao remover cliente:", error);
      alert("Não foi possível remover o cliente.");
    }
  }

  const clientesFiltrados = clientes.filter((cliente) => {
    const texto = busca.toLowerCase().trim();

    if (!texto) {
      return true;
    }

    return (
      cliente.nome?.toLowerCase().includes(texto) ||
      cliente.documento?.toLowerCase().includes(texto) ||
      cliente.telefone?.toLowerCase().includes(texto) ||
      cliente.cep?.toLowerCase().includes(texto) ||
      cliente.cidade?.toLowerCase().includes(texto) ||
      cliente.uf?.toLowerCase().includes(texto)
    );
  });

  const colunas = [
    { chave: "nome" as keyof Cliente, titulo: "Nome" },
    { chave: "documento" as keyof Cliente, titulo: "Documento" },
    { chave: "telefone" as keyof Cliente, titulo: "Telefone" },
    { chave: "email" as keyof Cliente, titulo: "E-mail" },
    { chave: "cep" as keyof Cliente, titulo: "CEP" },
    { chave: "endereco" as keyof Cliente, titulo: "Endereço" },
    { chave: "nr" as keyof Cliente, titulo: "Nº" },
    { chave: "bairro" as keyof Cliente, titulo: "Bairro" },
    { chave: "cidade" as keyof Cliente, titulo: "Cidade" },
    { chave: "uf" as keyof Cliente, titulo: "UF" },
    {
      chave: "cliente_id" as keyof Cliente,
      titulo: "Ações",
      render: (_valor: any, cliente: Cliente) => (
        <div className={styles.acoesTabela}>
          <Botao
            texto="Editar"
            variante="secundario"
            onClick={() => editarCliente(cliente)}
          />
          <Botao
            texto="Excluir"
            variante="perigo"
            onClick={() => removerCliente(cliente)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="pagina">
      <div className="pagina-cabecalho">
        <div>
          <h1>Clientes</h1>
          <p>Cadastro e gerenciamento de clientes</p>
        </div>

        <Botao
          texto="Novo cliente"
          variante="primario"
          onClick={abrirNovoCliente}
        />
      </div>

      <div className="pagina-acoes">
        <Input
          label="Pesquisar"
          tipo="text"
          valor={busca}
          aoAlterar={setBusca}
          placeholder="Nome, CPF, telefone, CEP ou cidade"
        />
      </div>

      {carregando && clientes.length === 0 ? (
        <p>Carregando clientes...</p>
      ) : (
        <div className={styles.tabelaResponsiva}>
          <Tabela<Cliente>
            colunas={colunas}
            dados={clientesFiltrados}
            chaveLinha={(cliente) => cliente.cliente_id}
          />
        </div>
      )}

      <Modal
        aberto={modalAberto}
        titulo={clienteEditando ? "Editar cliente" : "Novo cliente"}
        aoFechar={fecharModal}
        aoConfirmar={salvar}
        textoConfirmar={carregando ? "Salvando..." : "Salvar"}
      >
        <div className={styles.formulario}>
          <Input
            label="Nome *"
            tipo="text"
            valor={nome}
            aoAlterar={setNome}
            placeholder="Nome completo"
          />

          <Input
            label="Documento"
            tipo="text"
            valor={documento}
            aoAlterar={setDocumento}
            placeholder="CPF ou CNPJ"
          />

          <Input
            label="Telefone"
            tipo="text"
            valor={telefone}
            aoAlterar={setTelefone}
            placeholder="(00) 00000-0000"
          />

          <Input
            label="E-mail"
            tipo="email"
            valor={email}
            aoAlterar={setEmail}
            placeholder="cliente@email.com"
          />

          <div className={styles.campoCep}>
            <div className={styles.inputCep}>
              <Input
                label="CEP *"
                tipo="text"
                valor={cep}
                aoAlterar={alterarCep}
                placeholder="00000-000"
              />
            </div>

            <div className={styles.botaoCep}>
              <Botao
                texto={buscandoCep ? "Consultando..." : "Buscar CEP"}
                variante="secundario"
                onClick={buscarCep}
              />
            </div>
          </div>

          <Input
            label="Endereço"
            tipo="text"
            valor={endereco}
            aoAlterar={setEndereco}
            placeholder="Rua, avenida..."
          />

          <Input
            label="Número *"
            tipo="number"
            valor={nr}
            aoAlterar={setNr}
            placeholder="Número"
          />

          <Input
            label="Bairro"
            tipo="text"
            valor={bairro}
            aoAlterar={setBairro}
            placeholder="Bairro"
          />

          <Input
            label="Cidade"
            tipo="text"
            valor={cidade}
            aoAlterar={setCidade}
            placeholder="Cidade"
          />

          <Input
            label="UF"
            tipo="text"
            valor={uf}
            aoAlterar={setUf}
            placeholder="PE"
          />
        </div>
      </Modal>
    </div>
  );
};

export default Clientes;