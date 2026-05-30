import React, { useEffect, useState } from "react";
import { Apple, Chrome, Download, Lock, Mail, UserPlus, X } from "lucide-react";
import LionLogo from "../components/LionLogo.jsx";
import { apiRequest, login as apiLogin } from "../services/api.js";

export default function Login({ onLogin, onSignup }) {
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });
  const [installPrompt, setInstallPrompt] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [signupOpen, setSignupOpen] = useState(false);
  const [signupMessage, setSignupMessage] = useState("");

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const installApp = async () => {
    if (!installPrompt) {
      return;
    }

    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoginError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    try {
      await apiLogin(email, password);
      const user = await apiRequest("/users/me");
      onLogin(user);
    } catch {
      setLoginError("E-mail ou senha invalidos.");
    }
  };

  const submitSignup = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSignup?.({
      name: form.get("name"),
      email: form.get("email"),
      age: Number(form.get("age")),
      weight: Number(form.get("weight")),
      height: Number(form.get("height")),
      objective: form.get("objective"),
      notes: form.get("notes")
    });
    setSignupMessage("Cadastro enviado. Aguarde aprovacao do personal para liberar seu acesso.");
    setSignupOpen(false);
    event.currentTarget.reset();
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
              <input
                name="email"
                type="email"
                placeholder="E-mail"
                value={credentials.email}
                onChange={(event) => setCredentials((current) => ({ ...current, email: event.target.value }))}
                required
              />
            </div>
          </label>
          <label>
            <span>Senha</span>
            <div className="input-shell">
              <Lock size={16} />
              <input
                name="password"
                type="password"
                placeholder="Senha"
                value={credentials.password}
                onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))}
                minLength={8}
                required
              />
            </div>
          </label>
          {loginError ? <p className="login-error">{loginError}</p> : null}
          <button className="forgot-link" type="button">Esqueci minha senha</button>
          <button className="metal-button" type="submit">Entrar</button>
          {installPrompt ? (
            <button className="install-app-button" type="button" onClick={installApp}>
              <Download size={15} />
              Instalar app
            </button>
          ) : null}
          <div className="login-divider">ou continue com</div>
          <div className="social-row">
            <button type="button" aria-label="Entrar com Google"><Chrome size={22} /></button>
            <button type="button" aria-label="Entrar com Apple"><Apple size={23} /></button>
          </div>
          <small>
            Não tem uma conta?{" "}
            <button className="signup-link-button" type="button" onClick={() => setSignupOpen(true)}>
              Cadastre-se
            </button>
          </small>
          {signupMessage ? <p className="signup-success-message">{signupMessage}</p> : null}
        </form>
      </section>
      {signupOpen && (
        <div className="signup-modal-backdrop" role="presentation" onMouseDown={() => setSignupOpen(false)}>
          <form className="signup-modal" onSubmit={submitSignup} onMouseDown={(event) => event.stopPropagation()}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Cadastro do aluno</p>
                <h2>Solicitar acesso ao app</h2>
                <span>Preencha seus dados. O personal aprova seu cadastro antes de liberar o acesso.</span>
              </div>
              <button className="icon-button" type="button" onClick={() => setSignupOpen(false)} aria-label="Fechar">
                <X size={18} />
              </button>
            </div>
            <div className="form-grid">
              <label><span>Nome completo</span><input name="name" required placeholder="Seu nome" /></label>
              <label><span>Email</span><input name="email" type="email" required placeholder="voce@email.com" /></label>
              <label><span>Idade</span><input name="age" type="number" min="12" max="100" required /></label>
              <label><span>Peso</span><input name="weight" type="number" min="30" step="0.1" required placeholder="kg" /></label>
              <label><span>Altura</span><input name="height" type="number" min="1" max="2.5" step="0.01" required placeholder="1.67" /></label>
              <label><span>Objetivo</span><input name="objective" required placeholder="Emagrecimento, hipertrofia..." /></label>
              <label className="wide">
                <span>Observacoes</span>
                <textarea name="notes" rows="4" placeholder="Lesoes, rotina, restricoes, preferencias ou objetivo principal." />
              </label>
            </div>
            <button className="metal-button inline" type="submit">
              <UserPlus size={18} />
              Enviar cadastro
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
