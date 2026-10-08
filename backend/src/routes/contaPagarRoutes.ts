import { Router } from "express";

import { ContaPagarController } from "../controllers/ContaPagarController";

const router = Router();

router.get(
  "/",
  ContaPagarController.listar
);

router.post(
  "/",
  ContaPagarController.criar
);

router.put(
  "/:id",
  ContaPagarController.editar
);

router.get(
  "/:id/pagamentos",
  ContaPagarController.listarPagamentos
);

router.post(
  "/:id/pagamentos",
  ContaPagarController.pagar
);

router.put(
  "/:id/cancelar",
  ContaPagarController.cancelar
);

router.get(
  "/:id",
  ContaPagarController.buscarPorId
);

export default router;