import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

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

import LayoutPrincipal from "./layouts/LayoutPrincipal";

const App: React.FC = () => {
  const nomeUsuario = "Administrador";

  const aoSair = () => {
    localStorage.removeItem("mercadopro_token");
    window.location.href = "/login";
  };

  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        {/* Sistema */}
        <Route
          path="/dashboard"
          element={
            <LayoutPrincipal
              nomeUsuario={nomeUsuario}
              aoSair={aoSair}
            >
              <Dashboard />
            </LayoutPrincipal>
          }
        />

        <Route
          path="/pdv"
          element={
            <LayoutPrincipal
              nomeUsuario={nomeUsuario}
              aoSair={aoSair}
            >
              <PDV />
            </LayoutPrincipal>
          }
        />

        <Route
          path="/produtos"
          element={
            <LayoutPrincipal
              nomeUsuario={nomeUsuario}
              aoSair={aoSair}
            >
              <Produtos />
            </LayoutPrincipal>
          }
        />

        <Route
          path="/categorias"
          element={
            <LayoutPrincipal
              nomeUsuario={nomeUsuario}
              aoSair={aoSair}
            >
              <Categorias />
            </LayoutPrincipal>
          }
        />

        <Route
          path="/estoque"
          element={
            <LayoutPrincipal
              nomeUsuario={nomeUsuario}
              aoSair={aoSair}
            >
              <Estoque />
            </LayoutPrincipal>
          }
        />

        <Route
          path="/clientes"
          element={
            <LayoutPrincipal
              nomeUsuario={nomeUsuario}
              aoSair={aoSair}
            >
              <Clientes />
            </LayoutPrincipal>
          }
        />

        <Route
          path="/fornecedores"
          element={
            <LayoutPrincipal
              nomeUsuario={nomeUsuario}
              aoSair={aoSair}
            >
              <Fornecedores />
            </LayoutPrincipal>
          }
        />

        <Route
          path="/compras"
          element={
            <LayoutPrincipal
              nomeUsuario={nomeUsuario}
              aoSair={aoSair}
            >
              <Compras />
            </LayoutPrincipal>
          }
        />

        <Route
          path="/caixa"
          element={
            <LayoutPrincipal
              nomeUsuario={nomeUsuario}
              aoSair={aoSair}
            >
              <Caixa />
            </LayoutPrincipal>
          }
        />

        <Route
          path="/contas-pagar"
          element={
            <LayoutPrincipal
              nomeUsuario={nomeUsuario}
              aoSair={aoSair}
            >
              <ContasPagar />
            </LayoutPrincipal>
          }
        />

        <Route
          path="/contas-receber"
          element={
            <LayoutPrincipal
              nomeUsuario={nomeUsuario}
              aoSair={aoSair}
            >
              <ContasReceber />
            </LayoutPrincipal>
          }
        />

        <Route
          path="/relatorios"
          element={
            <LayoutPrincipal
              nomeUsuario={nomeUsuario}
              aoSair={aoSair}
            >
              <Relatorios />
            </LayoutPrincipal>
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default App;