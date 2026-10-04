import { Router } from "express";
import { CaixaController } from "../controllers/CaixaController";

const router = Router();

router.get("/atual", CaixaController.atual);

router.post("/abrir", CaixaController.abrir);

router.post("/fechar", CaixaController.fechar);

export default router;