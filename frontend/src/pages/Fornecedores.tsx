import React, { useEffect, useState } from "react";

import Tabela, {
  ColunaTabela,
} from "../components/Tabela";

import Modal from "../components/Modal";
import Input from "../components/Input";
import Botao from "../components/Botao";

import { Fornecedor } from "../types/Fornecedor";
import api from "../services/api";

interface FornecedorTela extends Fornecedor {
  cep?: string;
  nr?: number;
  bairro?: string;
  cidade?: string;
  uf?: string;
}

interface RespostaCep {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

const Fornecedores: React.FC = () => {
  const [fornecedores, setFornecedores] =
    useState<FornecedorTela[]>([]);

  const [modalAberto, setModalAberto] =
    useState(false);

  const [fornecedorEditando, setFornecedorEditando] =
    useState<number | null>(null);

  const [pesquisa, setPesquisa] =
    useState("");

  const [nome, setNome] =
    useState("");

  const [cnpj, setCnpj] =
    useState("");

  const [telefone, setTelefone] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [cep, setCep] =
    useState("");

  const [endereco, setEndereco] =
    useState("");

  const [nr, setNr] =
    useState("");

  const [bairro, setBairro] =
    useState("");

  const [cidade, setCidade] =
    useState("");

  const [uf, setUf] =
    useState("");

  const [produtosFornecidos, setProdutosFornecidos] =
    useState("");

  const [buscandoCep, setBuscandoCep] =
    useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregarFornecedores() {
      try {
        const resposta =
          await api.get("/fornecedores");

        if (ativo) {
          setFornecedores(
            resposta.data
          );
        }
      } catch (error) {
        console.error(
          "Erro ao carregar fornecedores:",
          error
        );

        alert(
          "Não foi possível carregar os fornecedores."
        );
      }
    }

    carregarFornecedores();

    return () => {
      ativo = false;
    };
  }, []);

  function validarCNPJ(
    valor: string
  ): boolean {
    const numero =
      valor.replace(/\D/g, "");

    if (numero.length !== 14) {
      return false;
    }

    if (
      /^(\d)\1{13}$/.test(numero)
    ) {
      return false;
    }

    const calcularDigito = (
      base: string,
      pesos: number[]
    ): number => {
      let soma = 0;

      for (
        let i = 0;
        i < pesos.length;
        i++
      ) {
        soma +=
          Number(base[i]) *
          pesos[i];
      }

      const resto = soma % 11;

      return resto < 2
        ? 0
        : 11 - resto;
    };

    const primeiroDigito =
      calcularDigito(
        numero.substring(0, 12),
        [
          5, 4, 3, 2,
          9, 8, 7, 6,
          5, 4, 3, 2,
        ]
      );

    if (
      primeiroDigito !==
      Number(
        numero.charAt(12)
      )
    ) {
      return false;
    }

    const segundoDigito =
      calcularDigito(
        numero.substring(0, 13),
        [
          6, 5, 4, 3, 2,
          9, 8, 7, 6, 5,
          4, 3, 2,
        ]
      );

    if (
      segundoDigito !==
      Number(
        numero.charAt(13)
      )
    ) {
      return false;
    }

    return true;
  }

  function formatarCep(
    valor: string
  ): string {
    const numeros =
      valor
        .replace(/\D/g, "")
        .slice(0, 8);

    if (numeros.length <= 5) {
      return numeros;
    }

    return `${numeros.slice(
      0,
      5
    )}-${numeros.slice(5)}`;
  }

  async function buscarCep(
    valor: string
  ) {
    const cepNumerico =
      valor.replace(/\D/g, "");

    if (
      cepNumerico.length !== 8
    ) {
      return;
    }

    try {
      setBuscandoCep(true);

      const resposta =
        await fetch(
          `https://viacep.com.br/ws/${cepNumerico}/json/`
        );

      if (!resposta.ok) {
        throw new Error(
          "Erro ao consultar o CEP."
        );
      }

      const dados =
        (await resposta.json()) as RespostaCep;

      if (dados.erro) {
        alert(
          "CEP não encontrado."
        );
        return;
      }

      setEndereco(
        dados.logradouro ?? ""
      );

      setBairro(
        dados.bairro ?? ""
      );

      setCidade(
        dados.localidade ?? ""
      );

      setUf(
        dados.uf ?? ""
      );
    } catch (error) {
      console.error(
        "Erro ao buscar CEP:",
        error
      );

      alert(
        "Não foi possível consultar o CEP."
      );
    } finally {
      setBuscandoCep(false);
    }
  }

  function limparFormulario() {
    setNome("");
    setCnpj("");
    setTelefone("");
    setEmail("");
    setCep("");
    setEndereco("");
    setNr("");
    setBairro("");
    setCidade("");
    setUf("");
    setProdutosFornecidos("");
    setFornecedorEditando(null);
  }

  function abrirNovoFornecedor() {
    limparFormulario();
    setModalAberto(true);
  }

  function editarFornecedor(
    fornecedor: FornecedorTela
  ) {
    setFornecedorEditando(
      fornecedor.fornecedor_id
    );

    setNome(
      fornecedor.nome ?? ""
    );

    setCnpj(
      fornecedor.cnpj ?? ""
    );

    setTelefone(
      fornecedor.telefone ?? ""
    );

    setEmail(
      fornecedor.email ?? ""
    );

    setCep(
      fornecedor.cep ?? ""
    );

    setEndereco(
      fornecedor.endereco ?? ""
    );

    setNr(
      fornecedor.nr !==
        undefined &&
      fornecedor.nr !== null
        ? String(
            fornecedor.nr
          )
        : ""
    );

    setBairro(
      fornecedor.bairro ?? ""
    );

    setCidade(
      fornecedor.cidade ?? ""
    );

    setUf(
      fornecedor.uf ?? ""
    );

    setProdutosFornecidos(
      fornecedor.produtos_fornecidos ?? ""
    );

    setModalAberto(true);
  }

  async function salvar() {
    if (!nome.trim()) {
      alert(
        "Informe o nome do fornecedor."
      );
      return;
    }

    if (!cnpj.trim()) {
      alert(
        "Informe o CNPJ do fornecedor."
      );
      return;
    }

    const cnpjNumerico =
      cnpj.replace(/\D/g, "");

    if (
      cnpjNumerico.length !== 14
    ) {
      alert(
        "O CNPJ deve possuir exatamente 14 números."
      );
      return;
    }

    if (
      !validarCNPJ(
        cnpjNumerico
      )
    ) {
      alert(
        "Informe um CNPJ válido."
      );
      return;
    }

    const cepNumerico =
      cep.replace(/\D/g, "");

    if (
      cepNumerico.length !== 8
    ) {
      alert(
        "Informe um CEP válido com 8 números."
      );
      return;
    }

    const numeroFornecedor =
      Number(
        nr.replace(/\D/g, "")
      );

    if (
      !nr.trim() ||
      !Number.isFinite(
        numeroFornecedor
      ) ||
      numeroFornecedor <= 0
    ) {
      alert(
        "Informe o número do endereço."
      );
      return;
    }

    if (!endereco.trim()) {
      alert(
        "Informe o endereço."
      );
      return;
    }

    if (!bairro.trim()) {
      alert(
        "Informe o bairro."
      );
      return;
    }

    if (!cidade.trim()) {
      alert(
        "Informe a cidade."
      );
      return;
    }

    if (!uf.trim()) {
      alert(
        "Informe a UF."
      );
      return;
    }

    try {
      const dados = {
        nome: nome.trim(),

        cnpj: cnpjNumerico,

        telefone:
          telefone.trim() || null,

        email:
          email.trim() || null,

        cep: cepNumerico,

        endereco:
          endereco.trim() || null,

        nr: numeroFornecedor,

        bairro:
          bairro.trim() || null,

        cidade:
          cidade.trim() || null,

        uf:
          uf.trim().toUpperCase() ||
          null,

        produtos_fornecidos:
          produtosFornecidos.trim() ||
          null,
      };

      if (
        fornecedorEditando !==
        null
      ) {
        await api.put(
          `/fornecedores/${fornecedorEditando}`,
          dados
        );

        alert(
          "Fornecedor atualizado com sucesso!"
        );
      } else {
        await api.post(
          "/fornecedores",
          dados
        );

        alert(
          "Fornecedor cadastrado com sucesso!"
        );
      }

      const resposta =
        await api.get(
          "/fornecedores"
        );

      setFornecedores(
        resposta.data
      );

      setModalAberto(false);

      limparFormulario();
    } catch (error: unknown) {
      console.error(
        "Erro ao salvar fornecedor:",
        error
      );

      alert(
        "Não foi possível salvar o fornecedor."
      );
    }
  }

  async function excluirFornecedor(
    fornecedor: FornecedorTela
  ) {
    const confirmar =
      window.confirm(
        `Deseja realmente excluir o fornecedor "${fornecedor.nome}"?`
      );

    if (!confirmar) {
      return;
    }

    try {
      await api.delete(
        `/fornecedores/${fornecedor.fornecedor_id}`
      );

      const resposta =
        await api.get(
          "/fornecedores"
        );

      setFornecedores(
        resposta.data
      );

      alert(
        "Fornecedor excluído com sucesso!"
      );
    } catch (error: unknown) {
      console.error(
        "Erro ao excluir fornecedor:",
        error
      );

      alert(
        "Não foi possível excluir o fornecedor."
      );
    }
  }

  const fornecedoresFiltrados =
    fornecedores.filter(
      (fornecedor) => {
        const termo =
          pesquisa
            .toLowerCase()
            .trim();

        if (!termo) {
          return true;
        }

        return (
          fornecedor.nome
            ?.toLowerCase()
            .includes(termo) ||
          fornecedor.cnpj
            ?.toLowerCase()
            .includes(termo) ||
          fornecedor.telefone
            ?.toLowerCase()
            .includes(termo) ||
          fornecedor.email
            ?.toLowerCase()
            .includes(termo) ||
          fornecedor.cep
            ?.toLowerCase()
            .includes(termo) ||
          fornecedor.endereco
            ?.toLowerCase()
            .includes(termo) ||
          fornecedor.bairro
            ?.toLowerCase()
            .includes(termo) ||
          fornecedor.cidade
            ?.toLowerCase()
            .includes(termo) ||
          fornecedor.uf
            ?.toLowerCase()
            .includes(termo) ||
          fornecedor.produtos_fornecidos
            ?.toLowerCase()
            .includes(termo)
        );
      }
    );

  const colunas: ColunaTabela<FornecedorTela>[] =
    [
      {
        chave: "nome",
        titulo: "Nome",
      },

      {
        chave: "cnpj",
        titulo: "CNPJ",
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
        chave: "cep",
        titulo: "CEP",
      },

      {
        chave: "endereco",
        titulo: "Endereço",
        render: (
          valor,
          fornecedor
        ) => {
          const numero =
            fornecedor.nr
              ? `, ${fornecedor.nr}`
              : "";

          return `${String(
            valor ?? ""
          )}${numero}`;
        },
      },

      {
        chave: "bairro",
        titulo: "Bairro",
      },

      {
        chave: "cidade",
        titulo: "Cidade",
      },

      {
        chave: "uf",
        titulo: "UF",
      },

      {
        chave:
          "produtos_fornecidos",
        titulo:
          "Produtos fornecidos",
      },

      {
        chave:
          "fornecedor_id",
        titulo: "Ações",

        render: (
          _valor,
          fornecedor
        ) => (
          <div
            style={{
              display: "flex",
              gap: 8,
            }}
          >
            <Botao
              texto="Editar"
              variante="secundario"
              onClick={() =>
                editarFornecedor(
                  fornecedor
                )
              }
            />

            <Botao
              texto="Excluir"
              variante="perigo"
              onClick={() =>
                excluirFornecedor(
                  fornecedor
                )
              }
            />
          </div>
        ),
      },
    ];

  return (
    <main
      style={{
        padding: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: 16,
          gap: 16,
        }}
      >
        <h2>
          Fornecedores
        </h2>

        <Botao
          texto="Novo Fornecedor"
          onClick={
            abrirNovoFornecedor
          }
        />
      </div>

      <input
        type="text"
        placeholder="Pesquisar fornecedor..."
        value={pesquisa}
        onChange={(e) =>
          setPesquisa(
            e.target.value
          )
        }
        style={{
          width: "100%",
          maxWidth: 500,
          padding:
            "10px 12px",
          marginBottom: 20,
          border:
            "1px solid #d1d5db",
          borderRadius: 6,
          fontSize: 14,
          outline: "none",
        }}
      />

      <Tabela
        colunas={colunas}
        dados={
          fornecedoresFiltrados
        }
        chaveLinha={(
          fornecedor
        ) =>
          String(
            fornecedor.fornecedor_id
          )
        }
      />

      <Modal
        aberto={modalAberto}
        titulo={
          fornecedorEditando !==
          null
            ? "Editar Fornecedor"
            : "Novo Fornecedor"
        }
        aoFechar={() => {
          setModalAberto(false);
          limparFormulario();
        }}
        aoConfirmar={salvar}
        textoConfirmar={
          fornecedorEditando !==
          null
            ? "Atualizar"
            : "Salvar"
        }
      >
        <Input
          label="Nome *"
          valor={nome}
          aoAlterar={setNome}
        />

        <Input
          label="CNPJ *"
          valor={cnpj}
          aoAlterar={(valor) => {
            const somenteNumeros =
              valor
                .replace(
                  /\D/g,
                  ""
                )
                .slice(0, 14);

            setCnpj(
              somenteNumeros
            );
          }}
        />

        <Input
          label="Telefone"
          valor={telefone}
          aoAlterar={
            setTelefone
          }
        />

        <Input
          label="E-mail"
          tipo="email"
          valor={email}
          aoAlterar={
            setEmail
          }
        />

        <Input
          label="CEP *"
          valor={formatarCep(cep)}
          aoAlterar={async (
            valor
          ) => {
            const somenteNumeros =
              valor
                .replace(
                  /\D/g,
                  ""
                )
                .slice(0, 8);

            setCep(
              somenteNumeros
            );

            if (
              somenteNumeros.length ===
              8
            ) {
              await buscarCep(
                somenteNumeros
              );
            }
          }}
        />

        {buscandoCep && (
          <p
            style={{
              margin:
                "4px 0",
              fontSize: 13,
            }}
          >
            Buscando endereço pelo CEP...
          </p>
        )}

        <Input
          label="Endereço *"
          valor={endereco}
          aoAlterar={
            setEndereco
          }
        />

        <Input
          label="Número *"
          valor={nr}
          aoAlterar={(valor) => {
            setNr(
              valor
                .replace(
                  /\D/g,
                  ""
                )
            );
          }}
        />

        <Input
          label="Bairro *"
          valor={bairro}
          aoAlterar={
            setBairro
          }
        />

        <Input
          label="Cidade *"
          valor={cidade}
          aoAlterar={
            setCidade
          }
        />

        <Input
          label="UF *"
          valor={uf}
          aoAlterar={(valor) => {
            setUf(
              valor
                .replace(
                  /[^a-zA-Z]/g,
                  ""
                )
                .slice(0, 2)
                .toUpperCase()
            );
          }}
        />

        <Input
          label="Produtos fornecidos"
          valor={
            produtosFornecidos
          }
          aoAlterar={
            setProdutosFornecidos
          }
        />
      </Modal>
    </main>
  );
};

export default Fornecedores;