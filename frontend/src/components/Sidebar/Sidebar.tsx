
import React from "react";
import MenuPrincipal from "../MenuPrincipal";
import "./Sidebar.css";

interface SidebarProps {
  aberto?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ aberto = false }) => {
  return (
    <aside className={`sidebar ${aberto ? "sidebar--aberto" : ""}`}>
      <div className="sidebar__logo">MercadoPro</div>
      <MenuPrincipal />
    </aside>
  );
};

export default Sidebar;
