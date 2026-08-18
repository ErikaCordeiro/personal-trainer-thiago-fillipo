import React, { useEffect, useState } from "react";
import { Apple, Chrome, Download, Eye, EyeOff, Lock, Mail, UserPlus, X } from "lucide-react";
import LionLogo from "../components/LionLogo.jsx";
import { apiRequest, login as apiLogin } from "../services/api.js";

export default function Login({ onLogin, onSignup, context = "platform", branding: initialBranding = null, brandSlug = "" }) {
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installMessage, setInstallMessage] = useState("");
  const [loginError, setLoginError] = useState("");
  const [keepConnected, setKeepConnected] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [signupMessage, setSignupMessage] = useState("");
  const [branding, setBranding] = useState(initialBranding);
  const isOwnerContext = context === "owner";

  useEffect(() => {
    const title = isOwnerContext ? "Fitland" : branding?.display_name || "Personal";
    document.title = title;
  }, [branding?.display_name, isOwnerContext]);

  useEffect(() => {
    const endpoint = isOwnerContext || !brandSlug
      ? "/branding/platform"
      : `/branding/public?slug=${encodeURIComponent(brandSlug)}`;
    apiRequest(endpoint, { skipAuthRefresh: true })
      .then(setBranding)
      .catch(() => setBranding(isOwnerContext
        ? { display_name: "Fitland", initials: "FT", is_fallback: true }
        : {
            display_name: brandSlug
              ? `Personal ${brandSlug.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ")}`
              : "Personal",
            initials: "PT",
            logo_url: brandSlug === "thiago-fillipo" ? "/lion-juda-logo.png" : "",
            icon_url: brandSlug === "thiago-fillipo" ? "/lion-juda-logo.png" : "",
            login_subtitle: "Disciplina • Foco • Propósito",
            is_fallback: true
          }));
  }, [isOwnerContext, brandSlug]);

  useEffect(() => {
    if (isOwnerContext || brandSlug || !credentials.email.includes("@")) return undefined;
    const timer = window.setTimeout(() => {
      resolvePersonalBrand();
    }, 450);
    return () => window.clearTimeout(timer);
  }, [credentials.email, isOwnerContext, brandSlug]);

  const resolvePersonalBrand = async () => {
    if (isOwnerContext || !credentials.email) return;
    try {
      const data = await apiRequest(`/branding/public?email=${encodeURIComponent(credentials.email)}`, { skipAuthRefresh: true });
      setBranding(data);
    } catch {
      setBranding((current) => current || { display_name: "Personal", initials: "PT", is_fallback: true });
    }
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
      setInstallMessage("Instalação disponível no Android/Chrome. Toque em Instalar app para adicionar na tela inicial.");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const getInstallFallbackMessage = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isChrome = /chrome|crios|edg/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|android/.test(userAgent);

    if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone) {
      return "O app já está instalado neste dispositivo.";
    }

    if (isIOS) {
      return isSafari
        ? "No iPhone/iPad: abra no Safari, toque no ícone Compartilhar e escolha Adicionar a Tela de Início. O iOS não permite instalar por botão direto."
        : "No iPhone/iPad: copie/abra este link no Safari, toque em Compartilhar e depois em Adicionar a Tela de Início.";
    }

    if (isAndroid) {
      return isChrome
        ? "No Android/Chrome: toque em Instalar app. Se não aparecer, abra o menu do Chrome e escolha Instalar app ou Adicionar a Tela inicial."
        : "No Android: abra este link no Chrome e toque em Instalar app ou Adicionar a Tela inicial.";
    }

    return "No computador: use Chrome/Edge e clique no ícone de instalar na barra de endereço ou no menu do navegador > Instalar Fitland.";
  };

  const installApp = async () => {
    if (!installPrompt) {
      setInstallMessage(getInstallFallbackMessage());
      return;
    }

    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);
    setInstallMessage(
      choice.outcome === "accepted"
        ? "Instalação iniciada. O app Fitland deve aparecer na tela inicial ou na lista de aplicativos."
        : getInstallFallbackMessage()
    );
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoginError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    try {
      await apiLogin(email, password, keepConnected);
      const user = await apiRequest("/users/me");
      onLogin(user);
    } catch (error) {
      const message = error?.message || "Não foi possível entrar. Tente novamente.";
      setLoginError(
        message === "Invalid email or password"
          ? "E-mail ou senha inválidos."
          : message
      );
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
    setSignupMessage("Cadastro enviado. aguarde aprovação do personal para liberar seu acesso.");
    setSignupOpen(false);
    event.currentTarget.reset();
  };

  return (
    <main className="login-screen">
      <div className="login-orbit" aria-hidden="true" />
      <section className="login-showcase">
        <LionLogo hero branding={branding} platform={isOwnerContext} />
      </section>
      <section className="phone-frame" aria-label="Tela de login">
        <div className="phone-speaker" />
        <form className="login-card" onSubmit={submit}>
          <LionLogo hero branding={branding} platform={isOwnerContext} />
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
                onBlur={resolvePersonalBrand}
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
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={credentials.password}
                onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))}
                minLength={8}
                autoComplete="current-password"
                required
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>
          <div className="login-options-row">
            <label className="keep-connected-option">
              <input
                type="checkbox"
                checked={keepConnected}
                onChange={(event) => setKeepConnected(event.target.checked)}
              />
              <span>Manter conectado</span>
            </label>
            <button className="forgot-link" type="button">Esqueci minha senha</button>
          </div>
          {loginError ? <p className="login-error">{loginError}</p> : null}
          <button className="metal-button" type="submit">Entrar</button>
          <button className="install-app-button" type="button" onClick={installApp}>
            <Download size={15} />
            Instalar app
          </button>
          {installMessage ? <p className="install-app-hint">{installMessage}</p> : null}
          <div className="login-divider">ou continue com</div>
          <div className="social-row">
            <button type="button" aria-label="Entrar com Google"><Chrome size={22} /></button>
            <button type="button" aria-label="Entrar com Apple"><Apple size={23} /></button>
          </div>
          {!isOwnerContext && <small>
            Não tem uma conta?{" "}
            <button className="signup-link-button" type="button" onClick={() => setSignupOpen(true)}>
              Cadastre-se
            </button>
          </small>}
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
                <span>Observações</span>
                <textarea name="notes" rows="4" placeholder="Lesões, rotina, restrições, preferências ou objetivo principal." />
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
