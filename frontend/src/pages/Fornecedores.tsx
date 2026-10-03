import React, { useEffect, useState } from "react";
import Tabela, { ColunaTabela } from "../components/Tabela";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Botao from "../components/Botao";
import { Fornecedor } from "../types/Fornecedor";
import api from "../services/api";

const Fornecedores: React.FC = () => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);

  const [modalAberto, setModalAberto] = useState(false);

  const [fornecedorEditando, setFornecedorEditando] =
    useState<number | null>(null);

  const [pesquisa, setPesquisa] = useState("");

  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [endereco, setEndereco] = useState("");
  const [produtosFornecidos, setProdutosFornecidos] =
    useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarFornecedores() {
      try {
        const resposta = await api.get("/fornecedores");

        if (ativo) {
          setFornecedores(resposta.data);
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

  /*
   * Validação matemática do CNPJ
   */
  function validarCNPJ(valor: string): boolean {
    const numero = valor.replace(/\D/g, "");

    if (numero.length !== 14) {
      return false;
    }

    // Impede CNPJ formado pelo mesmo número
    if (/^(\d)\1{13}$/.test(numero)) {
      return false;
    }

    const calcularDigito = (
      base: string,
      pesos: number[]
    ): number => {
      let soma = 0;

      for (let i = 0; i < pesos.length; i++) {
        soma += Number(base[i]) * pesos[i];
      }

      const resto = soma % 11;

      return resto < 2 ? 0 : 11 - resto;
    };

    const primeiroDigito = calcularDigito(
      numero.substring(0, 12),
      [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    );

    if (
      primeiroDigito !==
      Number(numero.charAt(12))
    ) {
      return false;
    }

    const segundoDigito = calcularDigito(
      numero.substring(0, 13),
      [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    );

    if (
      segundoDigito !==
      Number(numero.charAt(13))
    ) {
      return false;
    }

    return true;
  }

  function limparFormulario() {
    setNome("");
    setCnpj("");
    setTelefone("");
    setEmail("");
    setEndereco("");
    setProdutosFornecidos("");
    setFornecedorEditando(null);
  }

  function abrirNovoFornecedor() {
    limparFormulario();
    setModalAberto(true);
  }

  function editarFornecedor(
    fornecedor: Fornecedor
  ) {
    setFornecedorEditando(
      fornecedor.fornecedor_id
    );

    setNome(fornecedor.nome);
    setCnpj(fornecedor.cnpj ?? "");
    setTelefone(fornecedor.telefone ?? "");
    setEmail(fornecedor.email ?? "");
    setEndereco(fornecedor.endereco ?? "");
    setProdutosFornecidos(
      fornecedor.produtos_fornecidos ?? ""
    );

    setModalAberto(true);
  }

  async function salvar() {
    if (!nome.trim()) {
      alert("Informe o nome do fornecedor.");
      return;
    }

    /*
     * CNPJ é obrigatório
     * e deve possuir 14 números válidos.
     */
    if (!cnpj.trim()) {
      alert("Informe o CNPJ do fornecedor.");
      return;
    }

    const cnpjNumerico = cnpj.replace(/\D/g, "");

    if (cnpjNumerico.length !== 14) {
      alert(
        "O CNPJ deve possuir exatamente 14 números."
      );
      return;
    }

    if (!validarCNPJ(cnpjNumerico)) {
      alert("Informe um CNPJ válido.");
      return;
    }

    try {
      const dados = {
        nome: nome.trim(),

        // Envia somente números para o banco
        cnpj: cnpjNumerico,

        telefone:
          telefone.trim() || null,

        email:
          email.trim() || null,

        endereco:
          endereco.trim() || null,

        produtos_fornecidos:
          produtosFornecidos.trim() || null,
      };

      if (fornecedorEditando !== null) {
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
        await api.get("/fornecedores");

      setFornecedores(resposta.data);

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
    fornecedor: Fornecedor
  ) {
    const confirmar = window.confirm(
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
        await api.get("/fornecedores");

      setFornecedores(resposta.data);

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
        const termo = pesquisa
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
          fornecedor.endereco
            ?.toLowerCase()
            .includes(termo) ||
          fornecedor.produtos_fornecidos
            ?.toLowerCase()
            .includes(termo)
        );
      }
    );

  const colunas: ColunaTabela<Fornecedor>[] =
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
        chave: "endereco",
        titulo: "Endereço",
      },

      {
        chave: "produtos_fornecidos",
        titulo: "Produtos fornecidos",
      },

      {
        chave: "fornecedor_id",
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
    <main style={{ padding: 24 }}>
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
        <h2>Fornecedores</h2>

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
          setPesquisa(e.target.value)
        }
        style={{
          width: "100%",
          maxWidth: 500,
          padding: "10px 12px",
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
        chaveLinha={(fornecedor) =>
          String(
            fornecedor.fornecedor_id
          )
        }
      />

      <Modal
        aberto={modalAberto}
        titulo={
          fornecedorEditando !== null
            ? "Editar Fornecedor"
            : "Novo Fornecedor"
        }
        aoFechar={() => {
          setModalAberto(false);
          limparFormulario();
        }}
        aoConfirmar={salvar}
        textoConfirmar={
          fornecedorEditando !== null
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
          label="CNPJ"
          valor={cnpj}
          aoAlterar={(valor) => {
            const somenteNumeros =
              valor
                .replace(/\D/g, "")
                .slice(0, 14);

            setCnpj(
              somenteNumeros
            );
          }}
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