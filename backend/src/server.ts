import "dotenv/config";
import express from "express";
import cors from "cors";

import { authMiddleware } from "./middlewares/authMiddleware";
import { errorHandler } from "./middlewares/errorHandler";
import { AuthService } from "./services/AuthService";

import authRoutes from "./routes/authRoutes";
import categoriaRoutes from "./routes/categoriaRoutes";
import produtoRoutes from "./routes/produtoRoutes";
import estoqueRoutes from "./routes/estoqueRoutes";
import clienteRoutes from "./routes/clienteRoutes";
import fornecedorRoutes from "./routes/fornecedorRoutes";
import vendaRoutes from "./routes/vendaRoutes";
import compraRoutes from "./routes/compraRoutes";
import caixaRoutes from "./routes/caixaRoutes";
import contaPagarRoutes from "./routes/contaPagarRoutes";
import contaReceberRoutes from "./routes/contaReceberRoutes";
import relatorioRoutes from "./routes/relatorioRoutes";

const app = express();

app.use(cors());
app.use(express.json());

// ===============================
// ROTA PÚBLICA
// ===============================

app.use("/api/auth", authRoutes);

// ===============================
// ROTAS PROTEGIDAS
// ===============================

app.use(
  "/api/categorias",
  authMiddleware,
  categoriaRoutes
);

app.use(
  "/api/produtos",
  authMiddleware,
  produtoRoutes
);

app.use(
  "/api/estoque",
  authMiddleware,
  estoqueRoutes
);

app.use(
  "/api/clientes",
  authMiddleware,
  clienteRoutes
);

app.use(
  "/api/fornecedores",
  authMiddleware,
  fornecedorRoutes
);

app.use(
  "/api/vendas",
  authMiddleware,
  vendaRoutes
);

app.use(
  "/api/compras",
  authMiddleware,
  compraRoutes
);

app.use(
  "/api/caixa",
  authMiddleware,
  caixaRoutes
);

app.use(
  "/api/contas-pagar",
  authMiddleware,
  contaPagarRoutes
);

app.use(
  "/api/contas-receber",
  authMiddleware,
  contaReceberRoutes
);

app.use(
  "/api/relatorios",
  authMiddleware,
  relatorioRoutes
);

// ===============================
// TRATAMENTO DE ERROS
// ===============================

app.use(errorHandler);

// ===============================
// ADMIN PADRÃO
// ===============================

AuthService.criarAdminPadrao().catch((erro) => {
  console.error(
    "❌ Erro ao criar administrador:",
    erro
  );
});

// ===============================
// SERVIDOR LOCAL
// ===============================

const PORT = process.env.PORT || 3333;

if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(
      `🚀 MercadoPro backend rodando na porta ${PORT}`
    );
  });
}

export default app;