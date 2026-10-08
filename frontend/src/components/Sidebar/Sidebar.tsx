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
      </div>

      <MenuPrincipal
        aberto={aberto}
        aoAlternar={aoAlternar}
      />
    </aside>
  );
};

export default Sidebar;
