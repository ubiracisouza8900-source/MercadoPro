import { Request, Response } from "express";
import { VendaService } from "../services/VendaService";

export const VendaController = {
  async listar(_req: Request, res: Response) {
    const vendas = await VendaService.listar();

    return res.json(vendas);
  },

  async criar(req: Request, res: Response) {
    const { clienteId, formaPagamento, itens } = req.body;

    const usuario = (req as any).usuario;

    if (!usuario?.id) {
      return res.status(401).json({
        erro: "Usuário não autenticado.",
      });
    }

    const venda = await VendaService.criar(
      clienteId ?? null,
      Number(usuario.id),
      formaPagamento,
      itens
    );

    return res.status(201).json(venda);
  },

  async relatorio(_req: Request, res: Response) {
    const total = await VendaService.totalGeral();

    return res.json({ total });
  },
};