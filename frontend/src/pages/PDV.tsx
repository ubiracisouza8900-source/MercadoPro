
import React, { useEffect, useState } from "react";
import styles from "./PDV.module.css";

import Input from "../components/Input";
import Botao from "../components/Botao";
import Tabela, { ColunaTabela } from "../components/Tabela";

import { ItemVenda } from "../types/Venda";
import api from "../services/api";

type FormaPagamento =
  | "dinheiro"
  | "pix"
  | "credito"
  | "debito"
  | "fiado";

interface Produto {
  produtoId: number;
  nome: string;
  codigoBarras?: string;
  precoVenda: number;
  quantidadeEstoque: number;
}

interface Cliente {
  cliente_id: number;
  nome: string;
  documento?: string;
  telefone?: string;
  ativo?: boolean;
}

interface VendaCriada {
  id: number;
  clienteId?: number | null;
  usuarioId: number;
  caixaId?: number | null;
  total: number;
  formaPagamento: FormaPagamento;
  dataVenda: string;
  vencimento?: string | null;
}

interface ItemVendaEnvio {
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
}

const PDV: React.FC = () => {
  const [codigo, setCodigo] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [itens, setItens] = useState<ItemVenda[]>([]);
  const [formaPagamento, setFormaPagamento] =
    useState<FormaPagamento>("dinheiro");
  const [valorRecebido, setValorRecebido] = useState("");
  const [vencimento, setVencimento] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [ultimoProduto, setUltimoProduto] =
    useState<Produto | null>(null);
  const [vendaFinalizada, setVendaFinalizada] =
    useState<VendaCriada | null>(null);
  const [clienteBusca, setClienteBusca] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] =
    useState<Cliente | null>(null);
  const [buscandoCliente, setBuscandoCliente] = useState(false);

  const total = itens.reduce(
    (soma, item) => soma + item.quantidade * item.precoUnitario,
    0
  );

  const quantidadeTotal = itens.reduce(
    (soma, item) => soma + item.quantidade,
    0
  );

  const valorRecebidoNumero =
    Number(valorRecebido.replace(",", ".")) || 0;

  const troco = valorRecebidoNumero - total;

  function dinheiro(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function nomeFormaPagamento(forma: FormaPagamento) {
    const nomes: Record<FormaPagamento, string> = {
      dinheiro: "Dinheiro",
      pix: "PIX",
      credito: "Cartão de crédito",
      debito: "Cartão de débito",
      fiado: "Fiado",
    };

    return nomes[forma];
  }

  function formatarDataDigitada(valor: string) {
    const numeros = valor.replace(/\D/g, "").slice(0, 8);

    if (numeros.length <= 2) return numeros;

    if (numeros.length <= 4) {
      return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    }

    return `${numeros.slice(0, 2)}/${numeros.slice(
      2,
      4
    )}/${numeros.slice(4)}`;
  }

  function converterDataParaISO(valor: string) {
    const partes = valor.split("/");

    if (partes.length !== 3) return null;

    const diaTexto = partes[0];
    const mesTexto = partes[1];
    const anoTexto = partes[2];

    if (
      diaTexto.length !== 2 ||
      mesTexto.length !== 2 ||
      anoTexto.length !== 4
    ) {
      return null;
    }

    const dia = Number(diaTexto);
    const mes = Number(mesTexto);
    const ano = Number(anoTexto);

    if (
      !Number.isInteger(dia) ||
      !Number.isInteger(mes) ||
      !Number.isInteger(ano) ||
      dia < 1 ||
      dia > 31 ||
      mes < 1 ||
      mes > 12
    ) {
      return null;
    }

    const data = new Date(ano, mes - 1, dia);

    if (
      data.getFullYear() !== ano ||
      data.getMonth() !== mes - 1 ||
      data.getDate() !== dia
    ) {
      return null;
    }

    return `${ano}-${String(mes).padStart(
      2,
      "0"
    )}-${String(dia).padStart(2, "0")}`;
  }

  useEffect(() => {
    const busca = clienteBusca.trim();

    if (!busca || clienteSelecionado) return;

    const temporizador = setTimeout(async () => {
      try {
        setBuscandoCliente(true);

        const resposta = await api.get(
          `/clientes?busca=${encodeURIComponent(busca)}`
        );

        const dados = Array.isArray(resposta.data)
          ? resposta.data
          : [];

        const clientesNormalizados = dados
          .map((cliente) => ({
            ...cliente,
            cliente_id: Number(cliente.cliente_id),
          }))
          .filter(
            (cliente) =>
              Number.isInteger(cliente.cliente_id) &&
              cliente.cliente_id > 0
          );

        setClientes(clientesNormalizados);
      } catch (erro: unknown) {
        console.error("Erro ao pesquisar cliente:", erro);
        setClientes([]);
      } finally {
        setBuscandoCliente(false);
      }
    }, 300);

    return () => clearTimeout(temporizador);
  }, [clienteBusca, clienteSelecionado]);

  function selecionarCliente(cliente: Cliente) {
    if (
      !Number.isInteger(Number(cliente.cliente_id)) ||
      Number(cliente.cliente_id) <= 0
    ) {
      alert("Cliente inválido.");
      return;
    }

    setClienteSelecionado({
      ...cliente,
      cliente_id: Number(cliente.cliente_id),
    });

    setClienteBusca("");
    setClientes([]);
  }

  function removerCliente() {
    setClienteSelecionado(null);
    setClienteBusca("");
    setClientes([]);
  }

  async function adicionarItem() {
    const codigoLido = codigo.trim();
    const quantidadeInformada =
      Number(quantidade.replace(",", "."));

    if (!codigoLido) {
      alert("Digite ou bipe o código de barras.");
      return;
    }

    if (
      !Number.isFinite(quantidadeInformada) ||
      quantidadeInformada <= 0
    ) {
      alert("Informe uma quantidade válida.");
      return;
    }

    try {
      const resposta = await api.get<Produto>(
        `/produtos/codigo/${encodeURIComponent(codigoLido)}`
      );

      const produto = resposta.data;

      if (
        !produto ||
        !Number.isInteger(Number(produto.produtoId)) ||
        Number(produto.produtoId) <= 0
      ) {
        alert("Produto não encontrado.");
        return;
      }

      const produtoId = Number(produto.produtoId);
      const precoUnitario = Number(produto.precoVenda);
      const estoqueDisponivel = Number(produto.quantidadeEstoque);

      if (!Number.isFinite(precoUnitario) || precoUnitario < 0) {
        alert("Preço do produto inválido.");
        return;
      }

      if (
        !Number.isFinite(estoqueDisponivel) ||
        estoqueDisponivel < 0
      ) {
        alert("Estoque do produto inválido.");
        return;
      }

      setUltimoProduto(produto);

      const itemExistente = itens.find(
        (item) => Number(item.produtoId) === produtoId
      );

      const quantidadeAtual = itemExistente?.quantidade ?? 0;
      const novaQuantidade = quantidadeAtual + quantidadeInformada;

      if (novaQuantidade > estoqueDisponivel) {
        alert(
          `Estoque insuficiente. Disponível: ${estoqueDisponivel}.`
        );
        return;
      }

      if (itemExistente) {
        setItens((atual) =>
          atual.map((item) =>
            item.produtoId === produtoId
              ? {
                  ...item,
                  quantidade: novaQuantidade,
                  precoUnitario,
                }
              : item
          )
        );
      } else {
        setItens((atual) => [
          ...atual,
          {
            produtoId,
            produtoNome: produto.nome,
            quantidade: quantidadeInformada,
            precoUnitario,
          },
        ]);
      }

      setCodigo("");
      setQuantidade("1");
    } catch (erro: unknown) {
      console.error("Erro ao buscar produto:", erro);
      alert(
        "Não foi possível localizar o produto. Confira o código."
      );
    }
  }

  function alterarQuantidade(
    produtoId: number,
    novaQuantidade: number
  ) {
    if (
      !Number.isFinite(novaQuantidade) ||
      novaQuantidade <= 0
    ) {
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

  function limparVenda() {
    if (itens.length === 0) return;

    if (!window.confirm("Deseja cancelar esta venda?")) return;

    setItens([]);
    setCodigo("");
    setQuantidade("1");
    setValorRecebido("");
    setVencimento("");
    setFormaPagamento("dinheiro");
    setUltimoProduto(null);
    setClienteSelecionado(null);
    setClienteBusca("");
    setClientes([]);
  }

  function fecharComprovante() {
    setVendaFinalizada(null);
    setItens([]);
    setCodigo("");
    setQuantidade("1");
    setValorRecebido("");
    setVencimento("");
    setFormaPagamento("dinheiro");
    setUltimoProduto(null);
    setClienteSelecionado(null);
    setClienteBusca("");
    setClientes([]);
  }

  async function finalizarVenda() {
    if (itens.length === 0) {
      alert("Adicione pelo menos um produto.");
      return;
    }

    if (formaPagamento === "dinheiro") {
      if (valorRecebido.trim() === "") {
        alert("Informe o valor recebido.");
        return;
      }

      if (valorRecebidoNumero < total) {
        alert(
          `O valor recebido é menor que o total da venda. Faltam ${dinheiro(
            total - valorRecebidoNumero
          )}.`
        );
        return;
      }
    }

    let vencimentoISO: string | null = null;

    if (formaPagamento === "fiado") {
      if (!clienteSelecionado) {
        alert(
          "Para realizar uma venda fiado, selecione um cliente."
        );
        return;
      }

      const clienteId = Number(clienteSelecionado.cliente_id);

      if (!Number.isInteger(clienteId) || clienteId <= 0) {
        alert(
          "O cliente selecionado é inválido. Selecione o cliente novamente."
        );
        return;
      }

      if (!vencimento) {
        alert("Informe a data de vencimento da venda fiado.");
        return;
      }

      vencimentoISO = converterDataParaISO(vencimento);

      if (!vencimentoISO) {
        alert("Informe uma data válida no formato DD/MM/AAAA.");
        return;
      }
    }

    const itensVenda: ItemVendaEnvio[] = itens.map((item) => ({
      produtoId: Number(item.produtoId),
      quantidade: Number(item.quantidade),
      precoUnitario: Number(item.precoUnitario),
    }));

    const itemInvalido = itensVenda.find(
      (item) =>
        !Number.isInteger(item.produtoId) ||
        item.produtoId <= 0 ||
        !Number.isFinite(item.quantidade) ||
        item.quantidade <= 0 ||
        !Number.isFinite(item.precoUnitario) ||
        item.precoUnitario < 0
    );

    if (itemInvalido) {
      console.error("Item inválido:", itemInvalido);
      alert(
        "Existe um produto com dados inválidos no carrinho. Remova e adicione o produto novamente."
      );
      return;
    }

    let clienteId: number | null = null;

    if (formaPagamento === "fiado") {
      const idCliente = Number(clienteSelecionado?.cliente_id);

      if (!Number.isInteger(idCliente) || idCliente <= 0) {
        alert("Cliente inválido. Selecione o cliente novamente.");
        return;
      }

      clienteId = idCliente;
    }

    try {
      setCarregando(true);

      const resposta = await api.post<VendaCriada>("/vendas", {
        clienteId,
        itens: itensVenda,
        formaPagamento,
        valorRecebido:
          formaPagamento === "dinheiro"
            ? valorRecebidoNumero
            : total,
        total,
        vencimento:
          formaPagamento === "fiado"
            ? vencimentoISO
            : undefined,
      });

      setVendaFinalizada(resposta.data);
    } catch (erro: unknown) {
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
      render: (_, item) => (
        <div>
          <strong>{item.produtoNome}</strong>
          <div className={styles.codigoProduto}>
            Código: {item.produtoId}
          </div>
        </div>
      ),
    },
    {
      chave: "quantidade",
      titulo: "Quantidade",
      render: (_, item) => (
        <div className={styles.controleQuantidade}>
          <button
            type="button"
            onClick={() =>
              alterarQuantidade(item.produtoId, item.quantidade - 1)
            }
            disabled={item.quantidade <= 1}
            className={styles.botaoQuantidade}
          >
            −
          </button>

          <input
            type="number"
            min="0.001"
            step="0.001"
            value={item.quantidade}
            onChange={(evento) =>
              alterarQuantidade(
                item.produtoId,
                Number(evento.target.value)
              )
            }
            className={styles.inputQuantidade}
          />

          <button
            type="button"
            onClick={() =>
              alterarQuantidade(item.produtoId, item.quantidade + 1)
            }
            className={styles.botaoQuantidade}
          >
            +
          </button>
        </div>
      ),
    },
    {
      chave: "precoUnitario",
      titulo: "Preço",
      render: (valor) => dinheiro(Number(valor)),
    },
    {
      chave: "produtoId",
      titulo: "Subtotal",
      render: (_, item) => (
        <strong>
          {dinheiro(item.quantidade * item.precoUnitario)}
        </strong>
      ),
    },
    {
      chave: "produtoNome",
      titulo: "",
      render: (_, item) => (
        <button
          type="button"
          onClick={() => removerItem(item.produtoId)}
          className={styles.botaoRemover}
        >
          Remover
        </button>
      ),
    },
  ];

  return (
    <main className={styles.pagina}>
      <header className={styles.cabecalho}>
        <h1 className={styles.titulo}>Frente de Caixa</h1>
        <p className={styles.subtitulo}>
          Registre os produtos e finalize a venda.
        </p>
      </header>

      <section className={styles.layoutPrincipal}>
        <div className={styles.colunaProdutos}>
          <section className={styles.painel}>
            <h2 className={styles.tituloSecao}>Leitura de produto</h2>

            <div className={styles.formularioProduto}>
              <div className={styles.campoCodigo}>
                <Input
                  label="Código de barras"
                  valor={codigo}
                  aoAlterar={setCodigo}
                  placeholder="Bipe ou digite o código"
                />
              </div>

              <div className={styles.campoQtd}>
                <Input
                  label="Quantidade"
                  valor={quantidade}
                  aoAlterar={setQuantidade}
                  placeholder="1"
                />
              </div>

              <div className={styles.botaoAdicionar}>
                <Botao texto="Adicionar" onClick={adicionarItem} />
              </div>
            </div>
          </section>

          {ultimoProduto && (
            <section className={styles.ultimoProduto}>
              <div className={styles.etiquetaUltimoProduto}>
                Último produto lançado
              </div>

              <div className={styles.detalhesUltimoProduto}>
                <div className={styles.informacaoProduto}>
                  <strong className={styles.nomeUltimoProduto}>
                    {ultimoProduto.nome}
                  </strong>
                  <div className={styles.textoSecundario}>
                    Código de barras:{" "}
                    {ultimoProduto.codigoBarras || ultimoProduto.produtoId}
                  </div>
                </div>

                <div className={styles.precoUltimoProduto}>
                  <strong className={styles.valorUltimoProduto}>
                    {dinheiro(Number(ultimoProduto.precoVenda))}
                  </strong>
                  <div className={styles.textoSecundario}>
                    Estoque disponível: {ultimoProduto.quantidadeEstoque}
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className={styles.painelLista}>
            <div className={styles.cabecalhoLista}>
              <div>
                <h2 className={styles.tituloSecao}>Produtos da venda</h2>
                <p className={styles.contagemItens}>
                  {quantidadeTotal} item(ns)
                </p>
              </div>

              {itens.length > 0 && (
                <button
                  type="button"
                  onClick={limparVenda}
                  className={styles.botaoCancelarVenda}
                >
                  Cancelar venda
                </button>
              )}
            </div>

            {itens.length === 0 ? (
              <div className={styles.carrinhoVazio}>
                <div className={styles.iconeCarrinho}>🛒</div>
                <h3>Carrinho vazio</h3>
                <p>
                  Bipe ou digite o código de barras para adicionar produtos.
                </p>
              </div>
            ) : (
              <div className={styles.tabelaResponsiva}>
                <Tabela
                  colunas={colunas}
                  dados={itens}
                  chaveLinha={(item) => item.produtoId}
                />
              </div>
            )}
          </section>
        </div>

        <aside className={styles.resumoVenda}>
          <h2 className={styles.tituloResumo}>Resumo da venda</h2>

          <section className={styles.painelCliente}>
            <h3 className={styles.tituloCliente}>Cliente</h3>

            {clienteSelecionado ? (
              <div className={styles.clienteSelecionado}>
                <strong>{clienteSelecionado.nome}</strong>

                {clienteSelecionado.documento && (
                  <div className={styles.documentoCliente}>
                    Documento: {clienteSelecionado.documento}
                  </div>
                )}

                <button
                  type="button"
                  onClick={removerCliente}
                  className={styles.botaoTrocarCliente}
                >
                  Trocar cliente
                </button>
              </div>
            ) : (
              <>
                <Input
                  label="Pesquisar cliente"
                  valor={clienteBusca}
                  aoAlterar={setClienteBusca}
                  placeholder="Digite nome ou CPF"
                />

                {buscandoCliente && (
                  <div className={styles.mensagemPesquisa}>
                    Pesquisando...
                  </div>
                )}

                {clientes.length > 0 && (
                  <div className={styles.listaClientes}>
                    {clientes.map((cliente) => (
                      <button
                        key={cliente.cliente_id}
                        type="button"
                        onClick={() => selecionarCliente(cliente)}
                        className={styles.itemCliente}
                      >
                        <strong>{cliente.nome}</strong>
                        {cliente.documento && (
                          <div className={styles.documentoCliente}>
                            {cliente.documento}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {clienteBusca.trim() &&
                  !buscandoCliente &&
                  clientes.length === 0 && (
                    <p className={styles.mensagemSemCliente}>
                      Nenhum cliente encontrado.
                    </p>
                  )}
              </>
            )}
          </section>

          <div className={styles.linhaResumo}>
            <span>Quantidade de itens</span>
            <strong>{quantidadeTotal}</strong>
          </div>

          <div className={styles.linhaResumo}>
            <span>Produtos</span>
            <strong>{itens.length}</strong>
          </div>

          <hr className={styles.divisor} />

          <div className={styles.totalVenda}>
            <span className={styles.rotuloTotal}>Total da venda</span>
            <div className={styles.valorTotal}>{dinheiro(total)}</div>
          </div>

          <h3 className={styles.tituloPagamento}>Forma de pagamento</h3>

          <div className={styles.gradePagamentos}>
            {(
              [
                ["dinheiro", "Dinheiro"],
                ["pix", "PIX"],
                ["credito", "Crédito"],
                ["debito", "Débito"],
                ["fiado", "Fiado"],
              ] as [FormaPagamento, string][]
            ).map(([valor, texto]) => (
              <button
                key={valor}
                type="button"
                onClick={() => {
                  setFormaPagamento(valor);

                  if (valor !== "dinheiro") {
                    setValorRecebido("");
                  }

                  if (valor !== "fiado") {
                    setVencimento("");
                  }
                }}
                className={`${styles.botaoPagamento} ${
                  formaPagamento === valor
                    ? styles.pagamentoSelecionado
                    : ""
                }`}
              >
                {texto}
              </button>
            ))}
          </div>

          {formaPagamento === "dinheiro" && (
            <div className={styles.detalhesDinheiro}>
              <Input
                label="Valor recebido"
                valor={valorRecebido}
                aoAlterar={setValorRecebido}
                placeholder="Ex.: 30,00"
              />

              {valorRecebidoNumero > total && total > 0 && (
                <div className={styles.caixaTroco}>
                  <span>Troco</span>
                  <strong className={styles.valorTroco}>
                    {dinheiro(troco)}
                  </strong>
                </div>
              )}

              {valorRecebidoNumero > 0 &&
                valorRecebidoNumero < total && (
                  <div className={styles.caixaFalta}>
                    Falta{" "}
                    <strong>
                      {dinheiro(total - valorRecebidoNumero)}
                    </strong>
                  </div>
                )}
            </div>
          )}

          {formaPagamento === "fiado" && (
            <div className={styles.detalhesFiado}>
              <div className={styles.avisoFiado}>
                A venda será registrada como conta a receber.
              </div>

              {!clienteSelecionado && (
                <div className={styles.alertaClienteFiado}>
                  Selecione um cliente para realizar a venda fiado.
                </div>
              )}

              <Input
                label="Data de vencimento"
                valor={vencimento}
                aoAlterar={(valor) =>
                  setVencimento(formatarDataDigitada(valor))
                }
                placeholder="DD/MM/AAAA"
              />

              <div className={styles.ajudaVencimento}>
                Digite a data no formato DD/MM/AAAA.
              </div>
            </div>
          )}

          <div className={styles.acaoFinalizar}>
            <Botao
              texto={carregando ? "Finalizando..." : "Finalizar venda"}
              variante="sucesso"
              onClick={finalizarVenda}
            />
          </div>
        </aside>
      </section>

      {vendaFinalizada && (
        <div className={styles.fundoModal}>
          <div className={styles.comprovante}>
            <div className={styles.cabecalhoComprovante}>
              <h2 className={styles.nomeLoja}>MERCADOPRO</h2>
              <p className={styles.subtituloComprovante}>
                Comprovante de venda
              </p>
              <p className={styles.numeroVenda}>
                Venda #{vendaFinalizada.id}
              </p>
            </div>

            <div className={styles.dadosComprovante}>
              <p>
                <strong>Data:</strong>{" "}
                {new Date(vendaFinalizada.dataVenda).toLocaleString("pt-BR")}
              </p>

              {clienteSelecionado && (
                <p>
                  <strong>Cliente:</strong> {clienteSelecionado.nome}
                </p>
              )}
            </div>

            <div className={styles.itensComprovante}>
              {itens.map((item) => (
                <div
                  key={item.produtoId}
                  className={styles.itemComprovante}
                >
                  <div className={styles.descricaoItemComprovante}>
                    <strong>{item.produtoNome}</strong>
                    <div className={styles.detalheItemComprovante}>
                      {item.quantidade} x {dinheiro(item.precoUnitario)}
                    </div>
                  </div>
                  <strong>
                    {dinheiro(item.quantidade * item.precoUnitario)}
                  </strong>
                </div>
              ))}
            </div>

            <div className={styles.resumoComprovante}>
              <div className={styles.totalComprovante}>
                <span>TOTAL</span>
                <span>{dinheiro(vendaFinalizada.total)}</span>
              </div>

              <div className={styles.linhaComprovante}>
                <span>Pagamento</span>
                <strong>
                  {nomeFormaPagamento(vendaFinalizada.formaPagamento)}
                </strong>
              </div>

              {vendaFinalizada.formaPagamento === "dinheiro" && (
                <>
                  <div className={styles.linhaComprovante}>
                    <span>Recebido</span>
                    <strong>{dinheiro(valorRecebidoNumero)}</strong>
                  </div>
                  <div className={styles.linhaComprovante}>
                    <span>Troco</span>
                    <strong>{dinheiro(troco)}</strong>
                  </div>
                </>
              )}

              {vendaFinalizada.formaPagamento === "fiado" && (
                <div className={styles.linhaComprovante}>
                  <span>Vencimento</span>
                  <strong>{vencimento}</strong>
                </div>
              )}
            </div>

            <div className={styles.rodapeComprovante}>
              Obrigado pela preferência!
              <br />
              Este é um comprovante não fiscal.
            </div>

            <div className={styles.acoesComprovante}>
              <button
                type="button"
                onClick={() => window.print()}
                className={styles.botaoImprimir}
              >
                Imprimir
              </button>

              <button
                type="button"
                onClick={fecharComprovante}
                className={styles.botaoNovaVenda}
              >
                Nova venda
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default PDV;