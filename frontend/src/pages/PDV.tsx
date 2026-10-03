import React, { useState } from "react";


import Input from "../components/Input";
import Botao from "../components/Botao";
import Tabela, { ColunaTabela } from "../components/Tabela";

import { ItemVenda } from "../types/Venda";
import api from "../services/api";

type FormaPagamento = "dinheiro" | "pix" | "credito" | "debito";

interface Produto {
  produtoId: number;
  nome: string;
  codigoBarras?: string;
  precoVenda: number;
  quantidadeEstoque: number;
}

const PDV: React.FC = () => {
const [codigo, setCodigo] = useState("");
const [quantidade, setQuantidade] = useState("1");
const [itens, setItens] = useState<ItemVenda[]>([]);
const [formaPagamento, setFormaPagamento] =
useState<FormaPagamento>("dinheiro");
const [valorRecebido, setValorRecebido] = useState("");
const [carregando, setCarregando] = useState(false);

const total = itens.reduce(
(soma, item) => soma + item.quantidade * item.precoUnitario,
0
);

const troco = Number(valorRecebido.replace(",", ".")) - total;

async function adicionarItem() {
  const codigoLido = codigo.trim();
  const quantidadeInformada = Number(quantidade);

  if (!codigoLido) {
    alert("Digite ou bipe o código de barras.");
    return;
  }

  if (
    !Number.isInteger(quantidadeInformada) ||
    quantidadeInformada <= 0
  ) {
    alert("Informe uma quantidade válida.");
    return;
  }

  try {
    const resposta = await api.get(
      `/produtos/codigo/${encodeURIComponent(codigoLido)}`
    );

    const produto: Produto = resposta.data;

    if (!produto || !produto.produtoId) {
      alert("Produto não encontrado.");
      return;
    }

    const itemExistente = itens.find(
      (item) => item.produtoId === produto.produtoId
    );

    const quantidadeAtual = itemExistente?.quantidade ?? 0;
    const novaQuantidade =
      quantidadeAtual + quantidadeInformada;

    if (novaQuantidade > Number(produto.quantidadeEstoque)) {
      alert(
        `Estoque insuficiente. Disponível: ${
          produto.quantidadeEstoque
        }.`
      );
      return;
    }

    if (itemExistente) {
      setItens((atual) =>
        atual.map((item) =>
          item.produtoId === produto.produtoId
            ? {
                ...item,
                quantidade: novaQuantidade,
              }
            : item
        )
      );
    } else {
      setItens((atual) => [
        ...atual,
        {
          produtoId: produto.produtoId,
          produtoNome: produto.nome,
          quantidade: quantidadeInformada,
          precoUnitario: Number(produto.precoVenda),
        },
      ]);
    }

    setCodigo("");
    setQuantidade("1");
  } catch (erro) {
    console.error("Erro ao buscar produto:", erro);

    alert(
      "Não foi possível localizar o produto. Confira o código."
    );
  }
}

function alterarQuantidade(produtoId: number, novaQuantidade: number) {
if (!Number.isInteger(novaQuantidade) || novaQuantidade < 1) {
alert("A quantidade deve ser pelo menos 1.");
return;
}


setItens((atual) =>
  atual.map((item) =>
    item.produtoId === produtoId
      ? { ...item, quantidade: novaQuantidade }
      : item
  )
);


}

function removerItem(produtoId: number) {
setItens((atual) =>
atual.filter((item) => item.produtoId !== produtoId)
);
}

async function finalizarVenda() {
if (itens.length === 0) {
alert("Adicione pelo menos um produto.");
return;
}


if (
  formaPagamento === "dinheiro" &&
  Number(valorRecebido.replace(",", ".")) < total
) {
  alert("O valor recebido é menor que o total da venda.");
  return;
}

try {
  setCarregando(true);

  await api.post("/vendas", {
    itens,
    formaPagamento,
    valorRecebido:
      formaPagamento === "dinheiro"
        ? Number(valorRecebido.replace(",", "."))
        : total,
    total,
  });

  alert("Venda finalizada com sucesso!");

  setItens([]);
  setCodigo("");
  setQuantidade("1");
  setValorRecebido("");
  setFormaPagamento("dinheiro");
} catch (erro) {
  console.error("Erro ao finalizar venda:", erro);
  alert("Não foi possível finalizar a venda.");
} finally {
  setCarregando(false);
}


}

const colunas: ColunaTabela<ItemVenda>[] = [
{
chave: "produtoNome",
titulo: "Produto",
},
{
chave: "quantidade",
titulo: "Quantidade",
render: (valor, item) => (
<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
<button
type="button"
onClick={() =>
alterarQuantidade(item.produtoId, item.quantidade - 1)
}
disabled={item.quantidade <= 1}
>
− </button>

      <input
        type="number"
        min="1"
        value={item.quantidade}
        onChange={(evento) =>
          alterarQuantidade(
            item.produtoId,
            Number(evento.target.value)
          )
        }
        style={{ width: 60, textAlign: "center" }}
      />

      <button
        type="button"
        onClick={() =>
          alterarQuantidade(item.produtoId, item.quantidade + 1)
        }
      >
        +
      </button>
    </div>
  ),
},
{
  chave: "precoUnitario",
  titulo: "Preço unitário",
  render: (valor) =>
    Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    }),
},
{
  chave: "produtoId",
  titulo: "Subtotal",
  render: (_, item) =>
    (item.quantidade * item.precoUnitario).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    }),
},
{
  chave: "produtoId",
  titulo: "Ações",
  render: (_, item) => (
    <button
      type="button"
      onClick={() => removerItem(item.produtoId)}
    >
      Remover
    </button>
  ),
},


];

return (
<div>
  <main style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "flex-end",
          flexWrap: "wrap",
          marginTop: 20,
        }}
      >
        <div style={{ flex: 2, minWidth: 220 }}>
          <Input
            label="Código de barras"
            valor={codigo}
            aoAlterar={setCodigo}
            placeholder="Bipe ou digite o código"
          />
        </div>

        <div style={{ width: 120 }}>
          <Input
            label="Quantidade"
            valor={quantidade}
            aoAlterar={setQuantidade}
            placeholder="1"
          />
        </div>

        <Botao texto="Adicionar" onClick={adicionarItem} />
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>Produtos da venda</h3>
        <Tabela
          colunas={colunas}
          dados={itens}
          chaveLinha={(item) => item.produtoId}
        />
      </div>

      <section
        style={{
          marginTop: 24,
          padding: 20,
          border: "1px solid #ddd",
          borderRadius: 8,
        }}
      >
        <h2>
          Total:{" "}
          {total.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </h2>

        <h3>Forma de pagamento</h3>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {(
            [
              ["dinheiro", "Dinheiro"],
              ["pix", "PIX"],
              ["credito", "Cartão de crédito"],
              ["debito", "Cartão de débito"],
            ] as [FormaPagamento, string][]
          ).map(([valor, texto]) => (
            <button
              key={valor}
              type="button"
              onClick={() => setFormaPagamento(valor)}
              style={{
                padding: "10px 16px",
                borderRadius: 6,
                border:
                  formaPagamento === valor
                    ? "2px solid #2563eb"
                    : "1px solid #ccc",
                background:
                  formaPagamento === valor ? "#dbeafe" : "#fff",
                cursor: "pointer",
              }}
            >
              {texto}
            </button>
          ))}
        </div>

        {formaPagamento === "dinheiro" && (
          <div style={{ maxWidth: 280, marginTop: 16 }}>
            <Input
              label="Valor recebido"
              valor={valorRecebido}
              aoAlterar={setValorRecebido}
              placeholder="Ex.: 100,00"
            />

            <p>
              Troco:{" "}
              {Math.max(0, troco).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </p>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <Botao
            texto={carregando ? "Finalizando..." : "Finalizar venda"}
            variante="sucesso"
            onClick={finalizarVenda}
          />
        </div>
          </section>
    </main>
    </div>
);

};

export default PDV;
