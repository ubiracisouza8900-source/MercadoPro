import { Router } from "express";
import { CompraController } from "../controllers/CompraController";

const router = Router();
router.get("/", CompraController.listar);
router.post("/", CompraController.criar);
export default router;
