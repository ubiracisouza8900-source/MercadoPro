import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Input from "../components/Input";
import Botao from "../components/Botao";
import api from "../services/api";

interface ErroApi {
  erro?: string;
  mensagem?: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState(
    () => localStorage.getItem("mercadopro_email") || ""
  );

  const [senha, setSenha] = useState(
    () => localStorage.getItem("mercadopro_senha") || ""
  );

  const [lembrarLogin, setLembrarLogin] = useState(
    () =>
      localStorage.getItem(
        "mercadopro_lembrar_login"
      ) === "true"
  );

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  async function handleLogin() {
    setErro("");

    if (!email.trim() || !senha.trim()) {
      setErro("Informe o e-mail e a senha.");
      return;
    }

    try {
      setCarregando(true);

      const resposta = await api.post("/auth/login", {
        email: email.trim(),
        senha,
      });

      const token: string | undefined =
        resposta.data?.token;

      if (!token) {
        setErro(
          "O servidor não retornou o token de acesso."
        );
        return;
      }

      localStorage.setItem(
        "mercadopro_token",
        token
      );

      if (lembrarLogin) {
        localStorage.setItem(
          "mercadopro_email",
          email.trim()
        );

        localStorage.setItem(
          "mercadopro_senha",
          senha
        );

        localStorage.setItem(
          "mercadopro_lembrar_login",
          "true"
        );
      } else {
        localStorage.removeItem(
          "mercadopro_email"
        );

        localStorage.removeItem(
          "mercadopro_senha"
        );

        localStorage.removeItem(
          "mercadopro_lembrar_login"
        );
      }

      console.log(
        "✅ Login realizado com sucesso."
      );

      navigate("/dashboard");
    } catch (error: unknown) {
      console.error(
        "❌ Erro no login:",
        error
      );

      if (axios.isAxiosError<ErroApi>(error)) {
        const mensagem =
          error.response?.data?.mensagem ||
          error.response?.data?.erro ||
          "E-mail ou senha inválidos.";

        setErro(mensagem);
      } else {
        setErro(
          "Ocorreu um erro ao tentar fazer login."
        );
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-caixa">
        <h2>MercadoPro</h2>

        <p>Acesse sua conta</p>

        <Input
          label="E-mail"
          tipo="email"
          valor={email}
          aoAlterar={setEmail}
          placeholder="seu@email.com"
        />

        <Input
          label="Senha"
          tipo="password"
          valor={senha}
          aoAlterar={setSenha}
          placeholder="••••••••"
          erro={erro}
        />

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "12px",
            marginBottom: "18px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          <input
            type="checkbox"
            checked={lembrarLogin}
            onChange={(e) =>
              setLembrarLogin(e.target.checked)
            }
          />

          <span>Lembrar login</span>
        </label>

        <Botao
          texto={
            carregando
              ? "Entrando..."
              : "Entrar"
          }
          onClick={handleLogin}
          fullWidth
        />
      </div>
    </div>
  );
};

export default Login;