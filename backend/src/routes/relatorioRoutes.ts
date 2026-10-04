import { Router } from "express";
import { RelatorioController } from "../controllers/RelatorioController";

const router = Router();

router.get(
  "/resumo",
  RelatorioController.resumo
);

router.get(
  "/vendas-por-pagamento",
  RelatorioController.vendasPorPagamento
);

router.get(
  "/produtos-mais-vendidos",
  RelatorioController.produtosMaisVendidos
);

export default router;