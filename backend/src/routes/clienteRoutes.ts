import { Router } from "express";
import { ClienteController } from "../controllers/ClienteController";

const router = Router();
router.get("/", ClienteController.listar);
router.post("/", ClienteController.criar);
router.put("/:id", ClienteController.atualizar);
router.delete("/:id", ClienteController.remover);
export default router;
