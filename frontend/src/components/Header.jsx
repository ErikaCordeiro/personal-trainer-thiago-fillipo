import React from "react";
import { Bell, LogOut, Search } from "lucide-react";

export default function Header({ title, subtitle, user, onLogout }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Performance Studio</p>
        <h1>{title}</h1>
        <span>{subtitle}</span>
      </div>
      <div className="topbar-actions">
        <label className="search-shell">
          <Search size={18} />
          <input placeholder="Buscar aluno, treino ou exercício" />
        </label>
        <button className="icon-button" type="button" aria-label="Notificações">
          <Bell size={19} />
        </button>
        <div className="profile-chip">
          <span>{user?.name?.slice(0, 2) || "TF"}</span>
          <div>
            <strong>{user?.name || "Thiago"}</strong>
            <small>{user?.role === "student" ? "Aluno" : "Personal"}</small>
          </div>
        </div>
        <button className="icon-button" type="button" aria-label="Sair" onClick={onLogout}>
          <LogOut size={19} />
        </button>
      </div>
    </header>
  );
}
