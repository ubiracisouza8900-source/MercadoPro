import React from "react";
import MenuPrincipal from "../MenuPrincipal";
import "./Sidebar.css";

interface SidebarProps {
  aberto?: boolean;
  aoAlternar?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  aberto = false,
  aoAlternar,
}) => {
  return (
    <aside className={`sidebar ${aberto ? "sidebar--aberto" : ""}`}>
      <div className="sidebar__logo">
        <span>MercadoPro</span>

        <button
          type="button"
          className="sidebar__menu-botao"
          onClick={aoAlternar}
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
        >
          {aberto ? "✕" : "☰"}
        </button>
      </div>

      <MenuPrincipal />
    </aside>
  );
};

export default Sidebar;