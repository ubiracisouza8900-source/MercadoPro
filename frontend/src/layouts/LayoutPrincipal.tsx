import React from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "./LayoutPrincipal.css";

interface LayoutPrincipalProps {
  children: React.ReactNode;
  nomeUsuario: string;
  aoSair: () => void;
}



const LayoutPrincipal: React.FC<LayoutPrincipalProps> = ({
  children,
  nomeUsuario,
  aoSair,
}) => {
  return (
    <div className="layout-principal">
      <Header nomeUsuario={nomeUsuario} aoSair={aoSair} />

      <div className="layout-conteudo">
        <Sidebar />

        <main className="conteudo-principal">
          {children}
        </main>
      </div>
    </div>
  );
};

export default LayoutPrincipal;