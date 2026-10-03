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

export default router;