import { Router } from "express";

import { CompraController } from "../controllers/CompraController";
import { uploadBoleto } from "../middlewares/uploadBoleto";

const router = Router();

router.get(
  "/",
  CompraController.listar
);

router.post(
  "/",
  uploadBoleto.single("boleto"),
  CompraController.criar
);

router.put(
  "/:id",
  uploadBoleto.single("boleto"),
  CompraController.atualizar
);

router.delete(
  "/:id",
  CompraController.remover
);

router.get(
  "/:id/boleto",
  CompraController.visualizarBoleto
);

export default router;