import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { UsuarioModel } from "../models/Usuario";
import { ErroHttp } from "../middlewares/errorHandler";

export const AuthService = {
  async login(email: string, senha: string) {
    const usuario = await UsuarioModel.buscarPorEmail(email);

    if (!usuario) {
      throw new ErroHttp(
        "E-mail ou senha inválidos.",
        401
      );
    }

    const senhaValida = await bcrypt.compare(
      senha,
      usuario.senha
    );

    if (!senhaValida) {
      throw new ErroHttp(
        "E-mail ou senha inválidos.",
        401
      );
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        perfil: usuario.perfil,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "8h",
      }
    );

    return {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      },
    };
  },

  async criarAdminPadrao() {
    const email = process.env.ADMIN_EMAIL;
    const senha = process.env.ADMIN_PASSWORD;

    if (!email || !senha) {
      console.log(
        "ℹ️ ADMIN_EMAIL ou ADMIN_PASSWORD não configurados. Criação automática do administrador ignorada."
      );

      return;
    }

    const adminExistente =
      await UsuarioModel.buscarPorEmail(email);

    if (!adminExistente) {
      const senhaHash = await bcrypt.hash(
        senha,
        10
      );

      await UsuarioModel.criar(
        "Administrador",
        email,
        senhaHash,
        "admin"
      );

      console.log(
        "✅ Usuário administrador criado."
      );

      return;
    }

    console.log(
      "ℹ️ Usuário administrador já existe."
    );
  },
};