import React, { useState } from "react";
import { Eye, EyeOff, KeyRound, LogOut, ShieldCheck } from "lucide-react";
import { changeRequiredPassword } from "../services/api.js";

export default function RequiredPasswordChange({ onComplete, onLogout }) {
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    if (form.password !== form.confirm) {
      setMessage("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      const response = await changeRequiredPassword(form.password, form.confirm);
      onComplete(response.user);
    } catch (error) {
      setMessage(error.message || "Não foi possível alterar a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="required-password-screen">
      <section className="required-password-panel">
        <div className="required-password-brand"><ShieldCheck /><span>FITLAND</span></div>
        <p className="eyebrow">SEGURANÇA DA CONTA</p>
        <h1>Alterar senha</h1>
        <p>Defina uma senha definitiva antes de acessar a plataforma.</p>
        <form onSubmit={submit}>
          <label>Nova senha<div><KeyRound /><input required minLength="10" maxLength="128" type={visible ? "text" : "password"} autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /><button type="button" aria-label={visible ? "Ocultar senha" : "Mostrar senha"} onClick={() => setVisible((value) => !value)}>{visible ? <EyeOff /> : <Eye />}</button></div></label>
          <label>Confirmar nova senha<div><KeyRound /><input required minLength="10" maxLength="128" type={visible ? "text" : "password"} autoComplete="new-password" value={form.confirm} onChange={(event) => setForm({ ...form, confirm: event.target.value })} /></div></label>
          <ul><li>Mínimo de 10 caracteres</li><li>Use letras, números e um símbolo</li><li>Não reutilize a senha temporária</li></ul>
          {message && <p className="required-password-error" role="alert">{message}</p>}
          <button className="required-password-submit" disabled={loading}>{loading ? "Salvando..." : "Salvar nova senha"}</button>
        </form>
        <button className="required-password-logout" type="button" onClick={onLogout}><LogOut /> Sair com segurança</button>
      </section>
    </main>
  );
}
