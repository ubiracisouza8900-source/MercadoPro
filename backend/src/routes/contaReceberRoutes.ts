import { Router } from "express";
import { ContaReceberController } from "../controllers/ContaReceberController";

const router = Router();

router.get("/", ContaReceberController.listar);

router.post("/", ContaReceberController.criar);

router.put("/:id/receber", ContaReceberController.receber);

export default router;