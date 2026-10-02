import { Router } from "express";
import { FornecedorController } from "../controllers/FornecedorController";

const router = Router();

router.get("/", FornecedorController.listar);

router.post("/", FornecedorController.criar);

router.put("/:id", FornecedorController.atualizar);

router.delete("/:id", FornecedorController.remover);

export default router;