import React from "react";
import "./Tabela.css";

export interface ColunaTabela<T> {
  chave: keyof T;
  titulo: string;
  render?: (valor: any, linha: T) => React.ReactNode;
}

interface TabelaProps<T> {
  colunas: ColunaTabela<T>[];
  dados: T[];
  chaveLinha: (linha: T) => string | number;
  vazio?: string;
}

/**
 * Tabela - grid de dados genérico usado em Produtos, Clientes,
 * Fornecedores, Estoque, Compras, Contas etc.
 */
function Tabela<T>({ colunas, dados, chaveLinha, vazio = "Nenhum registro encontrado." }: TabelaProps<T>) {
  return (
    <div className="tabela-container">
      <table className="tabela">
        <thead>
          <tr>
            {colunas.map((coluna) => (
              <th key={String(coluna.chave)}>{coluna.titulo}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dados.length === 0 ? (
            <tr>
              <td className="tabela-vazia" colSpan={colunas.length}>
                {vazio}
              </td>
            </tr>
          ) : (
            dados.map((linha) => (
              <tr key={chaveLinha(linha)}>
                {colunas.map((coluna) => (
                  <td key={String(coluna.chave)}>
                    {coluna.render
                      ? coluna.render(linha[coluna.chave], linha)
                      : String(linha[coluna.chave] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Tabela;
