
import React from "react";
import "./MenuMobile.css";

interface MenuMobileProps {
  aberto: boolean;
  aoAlternar: () => void;
}

const MenuMobile: React.FC<MenuMobileProps> = ({
  aberto,
  aoAlternar,
}) => {
  return (
    <button
      type="button"
      className="menu-mobile"
      aria-label={aberto ? "Fechar menu" : "Abrir menu"}
      onClick={aoAlternar}
    >
      {aberto ? "✕" : "☰"}
    </button>
  );
};

export default MenuMobile;
