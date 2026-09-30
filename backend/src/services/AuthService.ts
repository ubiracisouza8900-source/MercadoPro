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
    const email = "admin@mercadopro.com";
    const senhaPadrao = "admin123";

    const adminExistente =
      await UsuarioModel.buscarPorEmail(email);

    const senhaHash = await bcrypt.hash(
      senhaPadrao,
      10
    );

    if (!adminExistente) {
      await UsuarioModel.criar(
        "Administrador",
        email,
        senhaHash,
        "admin"
      );

      console.log(
        "Usuário padrão criado: admin@mercadopro.com / admin123"
      );

      return;
    }

    await UsuarioModel.atualizarSenha(
      adminExistente.id,
      senhaHash
    );

    console.log(
      "🔐 Senha do administrador atualizada."
    );
  },
};