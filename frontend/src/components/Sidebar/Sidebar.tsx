import React from "react";
import MenuPrincipal from "../MenuPrincipal";
import "./Sidebar.css";

/**
 * Sidebar - barra lateral fixa da aplicação. Importa o MenuPrincipal
 * para renderizar os links de navegação.
 */
const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">MercadoPro</div>
      <MenuPrincipal />
    </aside>
  );
};

export default Sidebar;
