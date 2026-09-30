import React from "react";
import Botao from "../Botao";
import "./Modal.css";

interface ModalProps {
  aberto: boolean;
  titulo: string;
  aoFechar: () => void;
  children: React.ReactNode;
  aoConfirmar?: () => void;
  textoConfirmar?: string;
}

/**
 * Modal - janela sobreposta usada em toda a aplicação (confirmações,
 * formulários rápidos, detalhes). Importa o Botao internamente.
 */
const Modal: React.FC<ModalProps> = ({
  aberto,
  titulo,
  aoFechar,
  children,
  aoConfirmar,
  textoConfirmar = "Confirmar",
}) => {
  if (!aberto) return null;

  return (
    <div className="modal-fundo" onClick={aoFechar}>
      <div className="modal-caixa" onClick={(e) => e.stopPropagation()}>
        <div className="modal-cabecalho">
          <h3>{titulo}</h3>
          <button className="modal-fechar" onClick={aoFechar}>
            ×
          </button>
        </div>

        <div className="modal-corpo">{children}</div>

        <div className="modal-rodape">
          <Botao texto="Cancelar" variante="secundario" onClick={aoFechar} />
          {aoConfirmar && (
            <Botao texto={textoConfirmar} variante="primario" onClick={aoConfirmar} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
