import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Tabela, { ColunaTabela } from "../components/Tabela";
import Botao from "../components/Botao";
import api from "../services/api";
import styles from "./ContasReceber.module.css";

interface ContaReceber {
contaReceberId: number;
clienteId: number | null;
clienteNome: string;
vendaId: number | null;
descricao: string;
valor: number;
vencimento: string;
recebida: boolean;
recebidaEm: string | null;
}

interface ContaReceberApi {
contaReceberId?: number;
id?: number;
clienteId?: number | null;
clienteNome?: string | null;
vendaId?: number | null;
descricao?: string | null;
valor?: number | string | null;
vencimento?: string | null;
recebida?: boolean;
recebidaEm?: string | null;
}

interface RespostaErroApi {
erro?: string;
message?: string;
}

interface CriarContaPayload {
clienteId: number;
vendaId?: number;
descricao: string;
valor: number;
vencimento: string;
}

interface ReceberContaPayload {
valor: number;
formaPagamento: string;
observacao?: string;
}

type FormaPagamento = "dinheiro" | "pix" | "credito" | "debito";

type FiltroSituacao = "todas" | "abertas" | "vencidas" | "pagas";

const ContasReceber: React.FC = () => {
const [contas, setContas] = useState<ContaReceber[]>([]);
const [carregando, setCarregando] = useState(false);
const [mostrarFormulario, setMostrarFormulario] = useState(false);

const [clienteId, setClienteId] = useState("");
const [vendaId, setVendaId] = useState("");
const [descricao, setDescricao] = useState("");
const [valor, setValor] = useState("");
const [vencimento, setVencimento] = useState("");

const [contaSelecionada, setContaSelecionada] =
useState<ContaReceber | null>(null);

const [valorRecebimento, setValorRecebimento] = useState("");
const [formaPagamento, setFormaPagamento] =
useState<FormaPagamento>("dinheiro");
const [observacao, setObservacao] = useState("");
const [filtroSituacao, setFiltroSituacao] =
useState<FiltroSituacao>("todas");
const [busca, setBusca] = useState("");

function obterMensagemErro(
erro: unknown,
mensagemPadrao: string
): string {
if (!axios.isAxiosError<RespostaErroApi>(erro)) {
return mensagemPadrao;
}


return (
  erro.response?.data?.erro ??
  erro.response?.data?.message ??
  mensagemPadrao
);

}

function normalizarConta(
conta: ContaReceberApi
): ContaReceber | null {
const id = Number(conta.contaReceberId ?? conta.id);


if (!Number.isInteger(id) || id <= 0) {
  return null;
}

const valorNumerico = Number(conta.valor ?? 0);

return {
  contaReceberId: id,
  clienteId:
    conta.clienteId != null ? Number(conta.clienteId) : null,
  clienteNome:
    conta.clienteNome?.trim() || "Cliente não informado",
  vendaId:
    conta.vendaId != null ? Number(conta.vendaId) : null,
  descricao: conta.descricao?.trim() || "Conta a receber",
  valor: Number.isFinite(valorNumerico) ? valorNumerico : 0,
  vencimento: conta.vencimento ?? "",
  recebida: Boolean(conta.recebida),
  recebidaEm: conta.recebidaEm ?? null,
};


}

async function carregar(): Promise<void> {
try {
setCarregando(true);


  const resposta = await api.get<ContaReceberApi[]>(
    "/contas-receber"
  );

  const lista = Array.isArray(resposta.data)
    ? resposta.data
    : [];

  const contasNormalizadas = lista
    .map(normalizarConta)
    .filter(
      (conta): conta is ContaReceber => conta !== null
    );

  setContas(contasNormalizadas);
} catch (erro: unknown) {
  console.error("Erro ao carregar contas a receber:", erro);
  setContas([]);

  alert(
    obterMensagemErro(
      erro,
      "Não foi possível carregar as contas a receber."
    )
  );
} finally {
  setCarregando(false);
}


}

useEffect(() => {
const iniciar = async (): Promise<void> => {
await carregar();
};


void iniciar();


}, []);

function limparFormulario(): void {
setClienteId("");
setVendaId("");
setDescricao("");
setValor("");
setVencimento("");
}

async function criarConta(): Promise<void> {
const cliente = Number(clienteId);
const venda = vendaId ? Number(vendaId) : undefined;
const valorNumerico = Number(valor);

if (!Number.isInteger(cliente) || cliente <= 0) {
  alert("Informe um ID de cliente válido.");
  return;
}

if (!descricao.trim()) {
  alert("Informe a descrição.");
  return;
}

if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
  alert("Informe um valor válido.");
  return;
}

if (!vencimento) {
  alert("Informe o vencimento.");
  return;
}

if (
  venda !== undefined &&
  (!Number.isInteger(venda) || venda <= 0)
) {
  alert("Informe um ID de venda válido.");
  return;
}

const dados: CriarContaPayload = {
  clienteId: cliente,
  descricao: descricao.trim(),
  valor: valorNumerico,
  vencimento,
};

if (venda !== undefined) {
  dados.vendaId = venda;
}

try {
  await api.post("/contas-receber", dados);

  alert("Conta a receber cadastrada com sucesso.");
  limparFormulario();
  setMostrarFormulario(false);
  await carregar();
} catch (erro: unknown) {
  console.error("Erro ao criar conta a receber:", erro);

  alert(
    obterMensagemErro(
      erro,
      "Não foi possível cadastrar a conta."
    )
  );
}


}

function abrirRecebimento(conta: ContaReceber): void {
if (conta.recebida) return;


setContaSelecionada(conta);
setValorRecebimento(conta.valor.toFixed(2));
setFormaPagamento("dinheiro");
setObservacao("");


}

function fecharRecebimento(): void {
setContaSelecionada(null);
setValorRecebimento("");
setFormaPagamento("dinheiro");
setObservacao("");
}

async function receberConta(): Promise<void> {
if (!contaSelecionada) return;


const valorRecebido = Number(valorRecebimento);

if (!Number.isFinite(valorRecebido) || valorRecebido <= 0) {
  alert("Informe um valor válido.");
  return;
}

if (valorRecebido > contaSelecionada.valor) {
  alert("O valor recebido não pode ser maior que o valor da conta.");
  return;
}

if (valorRecebido < contaSelecionada.valor) {
  alert(
    "O recebimento parcial ainda não está disponível. Informe o valor total da conta."
  );
  return;
}

const dados: ReceberContaPayload = {
  valor: valorRecebido,
  formaPagamento,
};

const observacaoLimpa = observacao.trim();

if (observacaoLimpa) {
  dados.observacao = observacaoLimpa;
}

try {
  await api.put(
    `/contas-receber/${contaSelecionada.contaReceberId}/receber`,
    dados
  );

  alert("Recebimento registrado com sucesso.");
  fecharRecebimento();
  await carregar();
} catch (erro: unknown) {
  console.error("Erro ao registrar recebimento:", erro);

  alert(
    obterMensagemErro(
      erro,
      "Não foi possível registrar o recebimento."
    )
  );
}


}

function obterStatus(conta: ContaReceber): string {
if (conta.recebida) return "Paga";
if (!conta.vencimento) return "Aberta";


const hoje = new Date();
hoje.setHours(0, 0, 0, 0);

const vencimentoData = new Date(
  `${conta.vencimento}T00:00:00`
);

if (Number.isNaN(vencimentoData.getTime())) {
  return "Aberta";
}

if (vencimentoData < hoje) {
  return "Vencida";
}

return "Aberta";


}

function formatarData(data: string): string {
if (!data) return "-";


const dataFormatada = new Date(`${data}T00:00:00`);

if (Number.isNaN(dataFormatada.getTime())) {
  return "-";
}

return dataFormatada.toLocaleDateString("pt-BR");


}

function formatarMoeda(valorNumerico: number): string {
return valorNumerico.toLocaleString("pt-BR", {
style: "currency",
currency: "BRL",
});
}

const resumo = useMemo(() => {
let totalAberto = 0;
let totalVencido = 0;
let totalPago = 0;


contas.forEach((conta) => {
  const status = obterStatus(conta);

  if (status === "Paga") totalPago += conta.valor;
  if (status === "Aberta") totalAberto += conta.valor;
  if (status === "Vencida") totalVencido += conta.valor;
});

return {
  totalAberto,
  totalVencido,
  totalPago,
  totalGeral: totalAberto + totalVencido + totalPago,
};


}, [contas]);

const contasFiltradas = useMemo(() => {
const textoBusca = busca.trim().toLowerCase();


return contas.filter((conta) => {
  const status = obterStatus(conta);

  const correspondeSituacao =
    filtroSituacao === "todas" ||
    (filtroSituacao === "abertas" && status === "Aberta") ||
    (filtroSituacao === "vencidas" && status === "Vencida") ||
    (filtroSituacao === "pagas" && status === "Paga");

  if (!correspondeSituacao) return false;
  if (!textoBusca) return true;

  const cliente = conta.clienteNome.toLowerCase();
  const descricaoConta = conta.descricao.toLowerCase();
  const venda =
    conta.vendaId != null ? String(conta.vendaId) : "";

  return (
    cliente.includes(textoBusca) ||
    descricaoConta.includes(textoBusca) ||
    venda.includes(textoBusca)
  );
});


}, [contas, filtroSituacao, busca]);

const colunas: ColunaTabela<ContaReceber>[] = [
{
chave: "clienteNome",
titulo: "Cliente",
render: (valor) => String(valor || "Não informado"),
},
{
chave: "vendaId",
titulo: "Venda",
render: (valor) => (valor ? `#${valor}` : "-"),
},
{
chave: "descricao",
titulo: "Descrição",
},
{
chave: "valor",
titulo: "Valor",
render: (valor) => formatarMoeda(Number(valor)),
},
{
chave: "vencimento",
titulo: "Vencimento",
render: (valor) => formatarData(String(valor)),
},
{
chave: "recebida",
titulo: "Situação",
render: (_valor, linha) => {
const status = obterStatus(linha);


    const classeStatus =
      status === "Paga"
        ? styles.statusPaga
        : status === "Vencida"
        ? styles.statusVencida
        : styles.statusAberta;

    return (
      <span className={`${styles.status} ${classeStatus}`}>
        {status}
      </span>
    );
  },
},
{
  chave: "contaReceberId",
  titulo: "Ações",
  render: (_valor, linha) =>
    linha.recebida ? (
      <span className={styles.recebidaTexto}>Recebida</span>
    ) : (
      <Botao
        texto="Receber"
        variante="secundario"
        onClick={() => abrirRecebimento(linha)}
      />
    ),
},


];

return ( <main className={styles.pagina}> <div className={styles.cabecalho}> <div className={styles.introducao}> <h2>Contas a Receber</h2> <p>
Controle das vendas fiado e valores que os clientes ainda
precisam pagar. </p> </div>


    <Botao
      texto={mostrarFormulario ? "Fechar" : "Nova Conta"}
      variante="primario"
      onClick={() => {
        setMostrarFormulario(!mostrarFormulario);

        if (mostrarFormulario) {
          limparFormulario();
        }
      }}
    />
  </div>

  <section className={styles.resumo}>
    <div className={styles.cartaoResumo}>
      <div className={styles.rotuloResumo}>Total em aberto</div>
      <strong>{formatarMoeda(resumo.totalAberto)}</strong>
    </div>

    <div className={styles.cartaoResumo}>
      <div className={styles.rotuloResumo}>Total vencido</div>
      <strong>{formatarMoeda(resumo.totalVencido)}</strong>
    </div>

    <div className={styles.cartaoResumo}>
      <div className={styles.rotuloResumo}>Total recebido</div>
      <strong>{formatarMoeda(resumo.totalPago)}</strong>
    </div>

    <div className={styles.cartaoResumo}>
      <div className={styles.rotuloResumo}>Total registrado</div>
      <strong>{formatarMoeda(resumo.totalGeral)}</strong>
    </div>
  </section>

  {mostrarFormulario && (
    <section className={styles.secaoFormulario}>
      <h3>Nova Conta a Receber</h3>

      <div className={styles.formulario}>
        <input
          type="number"
          placeholder="ID do cliente"
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
        />

        <input
          type="number"
          placeholder="ID da venda (opcional)"
          value={vendaId}
          onChange={(e) => setVendaId(e.target.value)}
        />

        <input
          type="text"
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />

        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Valor"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
        />

        <input
          type="date"
          value={vencimento}
          onChange={(e) => setVencimento(e.target.value)}
        />

        <div className={styles.acoesFormulario}>
          <Botao
            texto="Salvar"
            variante="primario"
            onClick={criarConta}
          />
          <Botao
            texto="Cancelar"
            variante="secundario"
            onClick={() => {
              limparFormulario();
              setMostrarFormulario(false);
            }}
          />
        </div>
      </div>
    </section>
  )}

  <section className={styles.filtros}>
    <input
      type="text"
      placeholder="Buscar cliente, venda ou descrição..."
      value={busca}
      onChange={(e) => setBusca(e.target.value)}
    />

    <select
      value={filtroSituacao}
      onChange={(e) =>
        setFiltroSituacao(e.target.value as FiltroSituacao)
      }
    >
      <option value="todas">Todas as situações</option>
      <option value="abertas">Abertas</option>
      <option value="vencidas">Vencidas</option>
      <option value="pagas">Pagas</option>
    </select>
  </section>

  {carregando ? (
    <p>Carregando contas a receber...</p>
  ) : contasFiltradas.length === 0 ? (
    <div className={styles.estadoVazio}>
      <p>
        {contas.length === 0
          ? "Nenhuma conta a receber encontrada."
          : "Nenhuma conta corresponde aos filtros selecionados."}
      </p>
    </div>
  ) : (
    <div className={styles.tabelaResponsiva}>
      <Tabela
        colunas={colunas}
        dados={contasFiltradas}
        chaveLinha={(conta) => String(conta.contaReceberId)}
      />
    </div>
  )}

  {contaSelecionada && (
    <section className={styles.secaoRecebimento}>
      <h3>Registrar Recebimento</h3>

      <div className={styles.detalhesConta}>
        <p>
          Cliente: <strong>{contaSelecionada.clienteNome}</strong>
        </p>
        <p>
          Venda:{" "}
          <strong>
            {contaSelecionada.vendaId
              ? `#${contaSelecionada.vendaId}`
              : "Não vinculada"}
          </strong>
        </p>
        <p>
          Vencimento:{" "}
          <strong>{formatarData(contaSelecionada.vencimento)}</strong>
        </p>
        <p className={styles.ultimoDetalhe}>
          Valor da conta:{" "}
          <strong>{formatarMoeda(contaSelecionada.valor)}</strong>
        </p>
      </div>

      <div className={styles.formularioRecebimento}>
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Valor recebido"
          value={valorRecebimento}
          onChange={(e) => setValorRecebimento(e.target.value)}
        />

        <select
          value={formaPagamento}
          onChange={(e) =>
            setFormaPagamento(e.target.value as FormaPagamento)
          }
        >
          <option value="dinheiro">Dinheiro</option>
          <option value="pix">PIX</option>
          <option value="credito">Cartão de Crédito</option>
          <option value="debito">Cartão de Débito</option>
        </select>

        <input
          type="text"
          placeholder="Observação (opcional)"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
        />

        <div className={styles.acoesFormulario}>
          <Botao
            texto="Confirmar Recebimento"
            variante="primario"
            onClick={receberConta}
          />
          <Botao
            texto="Cancelar"
            variante="secundario"
            onClick={fecharRecebimento}
          />
        </div>
      </div>
    </section>
  )}
</main>


);
};

export default ContasReceber;
