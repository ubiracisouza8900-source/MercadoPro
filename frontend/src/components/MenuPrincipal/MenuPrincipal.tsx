import React from "react";
import { NavLink } from "react-router-dom";
import "./MenuPrincipal.css";

interface ItemMenu {
  rota: string;
  rotulo: string;
  icone?: string;
}

const itensMenu: ItemMenu[] = [
  { rota: "/dashboard", rotulo: "Dashboard", icone: "🏠" },
  { rota: "/pdv", rotulo: "PDV", icone: "🧾" },
  { rota: "/produtos", rotulo: "Produtos", icone: "📦" },
  { rota: "/categorias", rotulo: "Categorias", icone: "🏷️" },
  { rota: "/estoque", rotulo: "Estoque", icone: "📊" },
  { rota: "/clientes", rotulo: "Clientes", icone: "👥" },
  { rota: "/fornecedores", rotulo: "Fornecedores", icone: "🚚" },
  { rota: "/compras", rotulo: "Compras", icone: "🛒" },
  { rota: "/caixa", rotulo: "Caixa", icone: "💰" },
  { rota: "/contas-pagar", rotulo: "Contas a Pagar", icone: "📤" },
  { rota: "/contas-receber", rotulo: "Contas a Receber", icone: "📥" },
  { rota: "/relatorios", rotulo: "Relatórios", icone: "📈" },
];

/**
 * MenuPrincipal - lista de navegação principal, usada dentro do Sidebar.
 */
const MenuPrincipal: React.FC = () => {
  return (
    <nav className="menu-principal">
      {itensMenu.map((item) => (
        <NavLink
          key={item.rota}
          to={item.rota}
          className={({ isActive }) =>
            `menu-principal__item ${isActive ? "menu-principal__item--ativo" : ""}`
          }
        >
          <span className="menu-principal__icone">{item.icone}</span>
          <span>{item.rotulo}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default MenuPrincipal;
