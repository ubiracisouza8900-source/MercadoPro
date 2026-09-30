import { Router } from "express";
import { ContaPagarController } from "../controllers/ContaPagarController";

const router = Router();
router.get("/", ContaPagarController.listar);
router.post("/", ContaPagarController.criar);
router.put("/:id/pagar", ContaPagarController.pagar);
export default router;
