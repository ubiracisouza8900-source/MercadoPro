import React from "react";
import Botao from "../Botao";
import "./Header.css";

interface HeaderProps {
  nomeUsuario: string;
  aoSair: () => void;
}

/**
 * Header - barra superior fixa. Importa o Botao para a ação de sair.
 */
const Header: React.FC<HeaderProps> = ({ nomeUsuario, aoSair }) => {
  return (
    <header className="header">
      <div className="header__titulo">MercadoPro</div>
      <div className="header__usuario">
        <span>Olá, {nomeUsuario}</span>
        <Botao texto="Sair" variante="secundario" onClick={aoSair} />
      </div>
    </header>
  );
};

export default Header;
