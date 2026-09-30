import React from "react";
import Botao from "../Botao";
import "./CardAtalho.css";

interface CardAtalhoProps {
  titulo: string;
  descricao?: string;
  icone?: React.ReactNode;
  textoBotao?: string;
  aoClicar: () => void;
}

/**
 * CardAtalho - card de atalho rápido exibido no Dashboard
 * (ex: "Nova Venda", "Novo Produto", "Ver Relatórios").
 */
const CardAtalho: React.FC<CardAtalhoProps> = ({
  titulo,
  descricao,
  icone,
  textoBotao = "Acessar",
  aoClicar,
}) => {
  return (
    <div className="card-atalho">
      {icone && <div className="card-atalho__icone">{icone}</div>}
      <h4 className="card-atalho__titulo">{titulo}</h4>
      {descricao && <p className="card-atalho__descricao">{descricao}</p>}
      <Botao texto={textoBotao} variante="primario" onClick={aoClicar} fullWidth />
    </div>
  );
};

export default CardAtalho;
