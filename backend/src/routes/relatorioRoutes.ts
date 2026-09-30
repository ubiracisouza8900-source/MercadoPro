import { Router } from "express";
import { VendaController } from "../controllers/VendaController";

const router = Router();
router.get("/vendas", VendaController.relatorio);
export default router;
