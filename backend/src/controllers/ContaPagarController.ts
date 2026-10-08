import { Response } from "express";

import { ContaPagarService } from "../services/ContaPagarService";
import { RequestAutenticado } from "../middlewares/authMiddleware";

export const ContaPagarController = {
  async listar(
    _req: RequestAutenticado,
    res: Response
  ) {
    const contas =
      await ContaPagarService.listar();

    return res.json(contas);
  },

  async buscarPorId(
    req: RequestAutenticado,
    res: Response
  ) {
    const id = Number(req.params.id);

    const conta =
      await ContaPagarService.buscarPorId(id);

    return res.json(conta);
  },

  async criar(
    req: RequestAutenticado,
    res: Response
  ) {
    const {
      fornecedorId,
      descricao,
      valor,
      vencimento,
      dataEmissao,
    } = req.body;

    const conta =
      await ContaPagarService.criar(
        fornecedorId
          ? Number(fornecedorId)
          : null,
        descricao,
        Number(valor),
        vencimento,
        dataEmissao
      );

    return res.status(201).json(conta);
  },

  async editar(
    req: RequestAutenticado,
    res: Response
  ) {
    const contaId = Number(req.params.id);

    const {
      fornecedorId,
      descricao,
      valor,
      vencimento,
      dataEmissao,
    } = req.body;

    const conta =
      await ContaPagarService.editar(
        contaId,
        fornecedorId
          ? Number(fornecedorId)
          : null,
        descricao,
        Number(valor),
        vencimento,
        dataEmissao
      );

    return res.json(conta);
  },

  async pagar(
    req: RequestAutenticado,
    res: Response
  ) {
    const contaId =
      Number(req.params.id);

    const {
      formaPagamento,
      valor,
      caixaId,
      observacao,
    } = req.body;

    const usuarioId =
      req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        erro: "Usuário não autenticado.",
      });
    }

    const pagamento =
      await ContaPagarService.pagar(
        contaId,
        Number(usuarioId),
        caixaId
          ? Number(caixaId)
          : null,
        formaPagamento,
        Number(valor),
        observacao
      );

    return res.status(201).json(
      pagamento
    );
  },

  async listarPagamentos(
    req: RequestAutenticado,
    res: Response
  ) {
    const contaId =
      Number(req.params.id);

    const pagamentos =
      await ContaPagarService.listarPagamentos(
        contaId
      );

    return res.json(pagamentos);
  },

  async cancelar(
    req: RequestAutenticado,
    res: Response
  ) {
    const contaId =
      Number(req.params.id);

    const conta =
      await ContaPagarService.cancelar(
        contaId
      );

    return res.json(conta);
  },
};