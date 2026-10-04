import { ContaPagarModel } from "../models/ContaPagar";
import { ErroHttp } from "../middlewares/errorHandler";

export const ContaPagarService = {
  async listar() {
    return ContaPagarModel.listar();
  },

  async buscarPorId(id: number) {
    if (!id || id <= 0) {
      throw new ErroHttp(
        "ID da conta a pagar inválido.",
        400
      );
    }

    const conta = await ContaPagarModel.buscarPorId(id);

    if (!conta) {
      throw new ErroHttp(
        "Conta a pagar não encontrada.",
        404
      );
    }

    return conta;
  },

  async criar(
    fornecedorId: number | null,
    descricao: string,
    valor: number,
    vencimento: string,
    dataEmissao?: string
  ) {
    if (!descricao?.trim()) {
      throw new ErroHttp(
        "A descrição é obrigatória.",
        400
      );
    }

    if (!valor || valor <= 0) {
      throw new ErroHttp(
        "O valor deve ser maior que zero.",
        400
      );
    }

    if (!vencimento) {
      throw new ErroHttp(
        "O vencimento é obrigatório.",
        400
      );
    }

    return ContaPagarModel.criar(
      fornecedorId,
      descricao.trim(),
      valor,
      vencimento,
      dataEmissao
    );
  },

  async pagar(
    contaId: number,
    usuarioId: number,
    caixaId: number | null,
    formaPagamento: string,
    valor: number,
    observacao?: string
  ) {
    if (!contaId || contaId <= 0) {
      throw new ErroHttp(
        "ID da conta a pagar inválido.",
        400
      );
    }

    if (!usuarioId || usuarioId <= 0) {
      throw new ErroHttp(
        "Usuário não informado.",
        401
      );
    }

    const formasPagamento = [
      "dinheiro",
      "pix",
      "credito",
      "debito",
    ];

    if (!formasPagamento.includes(formaPagamento)) {
      throw new ErroHttp(
        "Forma de pagamento inválida.",
        400
      );
    }

    if (!valor || valor <= 0) {
      throw new ErroHttp(
        "O valor do pagamento deve ser maior que zero.",
        400
      );
    }

    const conta =
      await ContaPagarModel.buscarPorId(contaId);

    if (!conta) {
      throw new ErroHttp(
        "Conta a pagar não encontrada.",
        404
      );
    }

    if (conta.status === "cancelada") {
      throw new ErroHttp(
        "Não é possível pagar uma conta cancelada.",
        400
      );
    }

    if (
      conta.saldo_restante !== undefined &&
      valor > conta.saldo_restante
    ) {
      throw new ErroHttp(
        "O valor informado é maior que o saldo restante da conta.",
        400
      );
    }

    if (
      formaPagamento === "dinheiro" &&
      !caixaId
    ) {
      throw new ErroHttp(
        "É necessário ter um caixa aberto para pagamento em dinheiro.",
        400
      );
    }

    const pagamento =
      await ContaPagarModel.registrarPagamento(
        contaId,
        usuarioId,
        caixaId,
        formaPagamento,
        valor,
        observacao
      );

    return pagamento;
  },

  async listarPagamentos(contaId: number) {
    if (!contaId || contaId <= 0) {
      throw new ErroHttp(
        "ID da conta a pagar inválido.",
        400
      );
    }

    const conta =
      await ContaPagarModel.buscarPorId(contaId);

    if (!conta) {
      throw new ErroHttp(
        "Conta a pagar não encontrada.",
        404
      );
    }

    return ContaPagarModel.listarPagamentos(
      contaId
    );
  },

  async cancelar(contaId: number) {
    if (!contaId || contaId <= 0) {
      throw new ErroHttp(
        "ID da conta a pagar inválido.",
        400
      );
    }

    const conta =
      await ContaPagarModel.buscarPorId(contaId);

    if (!conta) {
      throw new ErroHttp(
        "Conta a pagar não encontrada.",
        404
      );
    }

    if (conta.status === "paga") {
      throw new ErroHttp(
        "Não é possível cancelar uma conta já paga.",
        400
      );
    }

    if (conta.status === "cancelada") {
      throw new ErroHttp(
        "A conta já está cancelada.",
        400
      );
    }

    return ContaPagarModel.cancelar(
      contaId
    );
  },
};