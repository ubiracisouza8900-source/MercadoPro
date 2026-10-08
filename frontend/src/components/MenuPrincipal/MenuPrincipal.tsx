import React from "react";
import { NavLink } from "react-router-dom";
import "./MenuPrincipal.css";

interface ItemMenu {
  rota: string;
  rotulo: string;
  icone?: string;
}

interface MenuPrincipalProps {
  aberto?: boolean;
  aoAlternar?: () => void;
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

const MenuPrincipal: React.FC<MenuPrincipalProps> = ({
  aberto = false,
  aoAlternar,
}) => {
  return (
    <div className="menu-principal">
      <div className="menu-principal__cabecalho">
        <span className="menu-principal__titulo">MenuPrincipal</span>

        <button
          type="button"
          className="menu-principal__botao"
          onClick={aoAlternar}
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
        >
          {aberto ? "✕" : "☰"}
        </button>
      </div>

      <nav
        className={`menu-principal__lista ${
          aberto ? "menu-principal__lista--aberta" : ""
        }`}
      >
        {itensMenu.map((item) => (
          <NavLink
            key={item.rota}
            to={item.rota}
            className={({ isActive }) =>
              `menu-principal__item ${
                isActive ? "menu-principal__item--ativo" : ""
              }`
            }
          >
            <span className="menu-principal__icone">{item.icone}</span>
            <span>{item.rotulo}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default MenuPrincipal;