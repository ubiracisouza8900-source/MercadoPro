import React from "react";
import "./Botao.css";

export type BotaoVariante = "primario" | "secundario" | "perigo" | "sucesso";

interface BotaoProps {
  texto: string;
  onClick?: () => void;
  variante?: BotaoVariante;
  tipo?: "button" | "submit" | "reset";
  desabilitado?: boolean;
  icone?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * Botao - componente único de botão usado em toda a aplicação.
 * Sempre importe este componente ao invés de criar <button> soltos.
 */
const Botao: React.FC<BotaoProps> = ({
  texto,
  onClick,
  variante = "primario",
  tipo = "button",
  desabilitado = false,
  icone,
  fullWidth = false,
}) => {
  return (
    <button
      type={tipo}
      className={`botao botao--${variante} ${fullWidth ? "botao--full" : ""}`}
      onClick={onClick}
      disabled={desabilitado}
    >
      {icone && <span className="botao__icone">{icone}</span>}
      {texto}
    </button>
  );
};

export default Botao;
