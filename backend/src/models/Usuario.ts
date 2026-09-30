import db from "../database/DB";

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
  perfil: string;
}

export const UsuarioModel = {
  async buscarPorEmail(
    email: string
  ): Promise<Usuario | undefined> {
    const resultado = await db.query(
      `
      SELECT
        usuario_id AS id,
        nome,
        email,
        senha,
        perfil
      FROM mercado_pro.usuarios
      WHERE email = $1
      `,
      [email]
    );

    return resultado.rows[0] as Usuario | undefined;
  },

  async criar(
    nome: string,
    email: string,
    senhaHash: string,
    perfil = "operador"
  ): Promise<Usuario> {
    const resultado = await db.query(
      `
      INSERT INTO mercado_pro.usuarios (
        nome,
        email,
        senha,
        perfil
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        usuario_id AS id,
        nome,
        email,
        senha,
        perfil
      `,
      [
        nome,
        email,
        senhaHash,
        perfil,
      ]
    );

    return resultado.rows[0] as Usuario;
  },

  async atualizarSenha(
    id: number,
    senhaHash: string
  ): Promise<void> {
    await db.query(
      `
      UPDATE mercado_pro.usuarios
      SET senha = $1
      WHERE usuario_id = $2
      `,
      [senhaHash, id]
    );
  },
};