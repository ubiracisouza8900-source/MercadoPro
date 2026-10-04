import { Response } from "express";
import { VendaService } from "../services/VendaService";
import { RequestAutenticado } from "../middlewares/authMiddleware";

export const VendaController = {
  async listar(_req: RequestAutenticado, res: Response) {
    const vendas = await VendaService.listar();

    return res.json(vendas);
  },

  async criar(req: RequestAutenticado, res: Response) {
    const {
      clienteId,
      formaPagamento,
      itens,
    } = req.body;

    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        erro: "Usuário não autenticado.",
      });
    }

    const venda = await VendaService.criar(
      clienteId ?? null,
      Number(usuarioId),
      formaPagamento,
      itens
    );

    return res.status(201).json(venda);
  },

  async relatorio(
    _req: RequestAutenticado,
    res: Response
  ) {
    const total = await VendaService.totalGeral();

    return res.json({ total });
  },
};