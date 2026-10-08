


import React, { useEffect, useState } from "react";
import axios from "axios";
import Botao from "../components/Botao";
import api from "../services/api";
import styles from "./Relatorios.module.css";

interface ResumoRelatorio {
  totalVendas: number;
  quantidadeVendas: number;
  totalCompras: number;
  contasReceber: number;
  contasPagar: number;
  valorEstoque: number;
}

interface VendaPorPagamento {
  formaPagamento: string;
  quantidade: number;
  valor: number;
}

interface ProdutoMaisVendido {
  produtoId: number;
  produtoNome: string;
  quantidade: number;
  valor: number;
}

interface RespostaErroApi {
  erro?: string;
  message?: string;
}

const Relatorios: React.FC = () => {
  const [resumo, setResumo] =
    useState<ResumoRelatorio | null>(null);

  const [vendasPorPagamento, setVendasPorPagamento] =
    useState<VendaPorPagamento[]>([]);

  const [produtosMaisVendidos, setProdutosMaisVendidos] =
    useState<ProdutoMaisVendido[]>([]);

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [carregando, setCarregando] = useState(false);

  function obterMensagemErro(erro: unknown): string {
    if (axios.isAxiosError<RespostaErroApi>(erro)) {
      return (
        erro.response?.data?.erro ??
        erro.response?.data?.message ??
        "Erro ao gerar relatório."
      );
    }

    return "Erro ao gerar relatório.";
  }

  function aplicarMascaraData(valor: string): string {
    const numeros = valor.replace(/\D/g, "").slice(0, 8);

    if (numeros.length <= 2) {
      return numeros;
    }

    if (numeros.length <= 4) {
      return numeros.slice(0, 2) + "/" + numeros.slice(2);
    }

    return (
      numeros.slice(0, 2) +
      "/" +
      numeros.slice(2, 4) +
      "/" +
      numeros.slice(4)
    );
  }

  function converterDataParaApi(
    data: string
  ): string | undefined {
    if (!data) {
      return undefined;
    }

    const resultado =
      /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(data);

    if (!resultado) {
      return undefined;
    }

    const dia = Number(resultado[1]);
    const mes = Number(resultado[2]);
    const ano = Number(resultado[3]);

    const dataTeste = new Date(ano, mes - 1, dia);

    if (
      dataTeste.getFullYear() !== ano ||
      dataTeste.getMonth() !== mes - 1 ||
      dataTeste.getDate() !== dia
    ) {
      return undefined;
    }

    return `${ano}-${String(mes).padStart(
      2,
      "0"
    )}-${String(dia).padStart(2, "0")}`;
  }

  async function gerarRelatorio(): Promise<void> {
    try {
      setCarregando(true);

      const dataInicioApi = converterDataParaApi(dataInicio);
      const dataFimApi = converterDataParaApi(dataFim);

      if (dataInicio && !dataInicioApi) {
        alert(
          "A data inicial deve estar no formato DD/MM/AAAA."
        );
        return;
      }

      if (dataFim && !dataFimApi) {
        alert(
          "A data final deve estar no formato DD/MM/AAAA."
        );
        return;
      }

      const parametros = {
        ...(dataInicioApi ? { dataInicio: dataInicioApi } : {}),
        ...(dataFimApi ? { dataFim: dataFimApi } : {}),
      };

      const [
        respostaResumo,
        respostaPagamentos,
        respostaProdutos,
      ] = await Promise.all([
        api.get<ResumoRelatorio>("/relatorios/resumo", {
          params: parametros,
        }),
        api.get<VendaPorPagamento[]>(
          "/relatorios/vendas-por-pagamento",
          {
            params: parametros,
          }
        ),
        api.get<ProdutoMaisVendido[]>(
          "/relatorios/produtos-mais-vendidos",
          {
            params: parametros,
          }
        ),
      ]);

      setResumo(respostaResumo.data);
      setVendasPorPagamento(respostaPagamentos.data);
      setProdutosMaisVendidos(respostaProdutos.data);
    } catch (erro: unknown) {
      console.error("Erro ao gerar relatório:", erro);
      alert(obterMensagemErro(erro));
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    async function iniciar(): Promise<void> {
      await gerarRelatorio();
    }

    void iniciar();
  }, []);

  function formatarMoeda(valor: number): string {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function nomeFormaPagamento(forma: string): string {
    const formas: Record<string, string> = {
      dinheiro: "Dinheiro",
      pix: "PIX",
      credito: "Cartão de Crédito",
      debito: "Cartão de Débito",
      fiado: "Fiado",
    };

    return formas[forma] ?? forma;
  }

  return (
    <main className={styles.pagina}>
      <h2 className={styles.titulo}>Relatórios</h2>

      <section className={styles.filtros}>
        <div className={styles.campoData}>
          <label htmlFor="data-inicio" className={styles.label}>
            Data inicial
          </label>

          <input
            id="data-inicio"
            type="text"
            inputMode="numeric"
            placeholder="DD/MM/AAAA"
            maxLength={10}
            value={dataInicio}
            onChange={(e) =>
              setDataInicio(aplicarMascaraData(e.target.value))
            }
            className={styles.inputData}
          />
        </div>

        <div className={styles.campoData}>
          <label htmlFor="data-fim" className={styles.label}>
            Data final
          </label>

          <input
            id="data-fim"
            type="text"
            inputMode="numeric"
            placeholder="DD/MM/AAAA"
            maxLength={10}
            value={dataFim}
            onChange={(e) =>
              setDataFim(aplicarMascaraData(e.target.value))
            }
            className={styles.inputData}
          />
        </div>

        <div className={styles.botaoGerar}>
          <Botao
            texto={carregando ? "Carregando..." : "Gerar relatório"}
            onClick={gerarRelatorio}
          />
        </div>
      </section>

      {resumo && (
        <>
          <section className={styles.gradeResumo}>
            <div className={styles.cardResumo}>
              <h3>Total de vendas</h3>
              <strong>{formatarMoeda(resumo.totalVendas)}</strong>
            </div>

            <div className={styles.cardResumo}>
              <h3>Quantidade de vendas</h3>
              <strong>{resumo.quantidadeVendas}</strong>
            </div>

            <div className={styles.cardResumo}>
              <h3>Total de compras</h3>
              <strong>{formatarMoeda(resumo.totalCompras)}</strong>
            </div>

            <div className={styles.cardResumo}>
              <h3>A receber</h3>
              <strong>{formatarMoeda(resumo.contasReceber)}</strong>
            </div>

            <div className={styles.cardResumo}>
              <h3>A pagar</h3>
              <strong>{formatarMoeda(resumo.contasPagar)}</strong>
            </div>

            <div className={styles.cardResumo}>
              <h3>Valor do estoque</h3>
              <strong>{formatarMoeda(resumo.valorEstoque)}</strong>
            </div>
          </section>

          <section className={styles.secaoTabela}>
            <h3>Vendas por forma de pagamento</h3>

            {vendasPorPagamento.length === 0 ? (
              <p>Nenhuma venda encontrada.</p>
            ) : (
              <div className={styles.tabelaResponsiva}>
                <table className={styles.tabela}>
                  <thead>
                    <tr>
                      <th>Forma de pagamento</th>
                      <th>Quantidade</th>
                      <th>Valor</th>
                    </tr>
                  </thead>

                  <tbody>
                    {vendasPorPagamento.map((item) => (
                      <tr key={item.formaPagamento}>
                        <td>
                          {nomeFormaPagamento(item.formaPagamento)}
                        </td>
                        <td>{item.quantidade}</td>
                        <td>{formatarMoeda(item.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className={styles.secaoTabela}>
            <h3>Produtos mais vendidos</h3>

            {produtosMaisVendidos.length === 0 ? (
              <p>Nenhum produto vendido encontrado.</p>
            ) : (
              <div className={styles.tabelaResponsiva}>
                <table className={styles.tabela}>
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Quantidade</th>
                      <th>Valor vendido</th>
                    </tr>
                  </thead>

                  <tbody>
                    {produtosMaisVendidos.map((produto) => (
                      <tr key={produto.produtoId}>
                        <td>{produto.produtoNome}</td>
                        <td>{produto.quantidade}</td>
                        <td>{formatarMoeda(produto.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
};

export default Relatorios;