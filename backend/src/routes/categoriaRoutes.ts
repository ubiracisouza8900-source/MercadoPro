import { Router } from "express";
import { CategoriaController } from "../controllers/CategoriaController";

const router = Router();

router.get("/", CategoriaController.listar);

router.post("/", CategoriaController.criar);

router.put("/:id", CategoriaController.atualizar);

router.delete("/:id", CategoriaController.remover);

export default router;