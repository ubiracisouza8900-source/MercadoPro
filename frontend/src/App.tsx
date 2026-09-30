import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PDV from "./pages/PDV";
import Produtos from "./pages/Produtos";
import Categorias from "./pages/Categorias";
import Estoque from "./pages/Estoque";
import Clientes from "./pages/Clientes";
import Fornecedores from "./pages/Fornecedores";
import Compras from "./pages/Compras";
import Caixa from "./pages/Caixa";
import ContasPagar from "./pages/ContasPagar";
import ContasReceber from "./pages/ContasReceber";
import Relatorios from "./pages/Relatorios";

/**
 * App - define todas as rotas da aplicação, cada uma apontando
 * para sua respectiva página.
 */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pdv" element={<PDV />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/estoque" element={<Estoque />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/fornecedores" element={<Fornecedores />} />
        <Route path="/compras" element={<Compras />} />
        <Route path="/caixa" element={<Caixa />} />
        <Route path="/contas-pagar" element={<ContasPagar />} />
        <Route path="/contas-receber" element={<ContasReceber />} />
        <Route path="/relatorios" element={<Relatorios />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
