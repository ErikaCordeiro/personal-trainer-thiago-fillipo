import React from "react";
import { Apple, Chrome, Lock, Mail } from "lucide-react";
import LionLogo from "../components/LionLogo.jsx";
import { apiRequest, login as apiLogin } from "../services/api.js";

export default function Login({ onLogin }) {
  const submit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    try {
      await apiLogin(email, password);
      const user = await apiRequest("/users/me");
      onLogin(user);
    } catch {
      const isErika = ["erikagcordeiro18@gmail.coom", "erikagcordeiro18@gmail.com"].includes(email.toLowerCase());
      onLogin({
        name: isErika ? "Erika Gomes Cordeiro" : email.includes("aluno") ? "Rafael Martins" : "Thiago Fillipo",
        email,
        role: isErika || email.includes("aluno") ? "student" : "personal"
      });
    }
  };

  return (
    <main className="login-screen">
      <div className="login-orbit" aria-hidden="true" />
      <section className="login-showcase">
        <LionLogo hero />
      </section>
      <section className="phone-frame" aria-label="Tela de login">
        <div className="phone-speaker" />
        <form className="login-card" onSubmit={submit}>
          <LionLogo hero />
          <p className="welcome-copy">Bem-vindo</p>
          <label>
            <span>Email</span>
            <div className="input-shell">
              <Mail size={16} />
              <input name="email" type="email" placeholder="E-mail" defaultValue="erikagcordeiro18@gmail.coom" required />
            </div>
          </label>
          <label>
            <span>Senha</span>
            <div className="input-shell">
              <Lock size={16} />
              <input name="password" type="password" placeholder="Senha" defaultValue="Personal@123" minLength={8} required />
            </div>
          </label>
          <button className="forgot-link" type="button">Esqueci minha senha</button>
          <button className="metal-button" type="submit">Entrar</button>
          <div className="login-divider">ou continue com</div>
          <div className="social-row">
            <button type="button" aria-label="Entrar com Google"><Chrome size={22} /></button>
            <button type="button" aria-label="Entrar com Apple"><Apple size={23} /></button>
          </div>
          <small>Não tem uma conta? <strong>Cadastre-se</strong></small>
        </form>
      </section>
    </main>
  );
}
