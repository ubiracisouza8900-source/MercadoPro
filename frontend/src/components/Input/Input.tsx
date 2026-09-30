import React from "react";
import "./Input.css";

interface InputProps {
  label?: string;
  placeholder?: string;
  valor: string;
  aoAlterar: (valor: string) => void;
  tipo?: "text" | "password" | "email" | "number" | "date";
  erro?: string;
  desabilitado?: boolean;
}

/**
 * Input - campo de formulário padrão do sistema.
 * Sempre importe este componente ao invés de criar <input> soltos.
 */
const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  valor,
  aoAlterar,
  tipo = "text",
  erro,
  desabilitado = false,
}) => {
  return (
    <div className="input-grupo">
      {label && <label className="input-label">{label}</label>}
      <input
        className={`input-campo ${erro ? "input-campo--erro" : ""}`}
        type={tipo}
        placeholder={placeholder}
        value={valor}
        disabled={desabilitado}
        onChange={(e) => aoAlterar(e.target.value)}
      />
      {erro && <span className="input-erro">{erro}</span>}
    </div>
  );
};

export default Input;
