import React from "react";
import { Bell, CalendarDays, LogOut, Menu, Search, Sparkles } from "lucide-react";

export default function Header({ title, subtitle, user, student, variant = "personal", onMenuClick, onLogout, onCoachClick }) {
  const firstName = user?.name?.split(" ")[0] || "Thiago";
  const studentHeading = title?.startsWith("Dieta") || title?.startsWith("Avaliac") ? "Bom dia," : "Bora treinar,";
  const heading = variant === "student" ? studentHeading : "Central de controle,";

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Performance Studio</p>
        <h1>
          {heading} <strong className="accent-name">{firstName}!</strong> <span aria-hidden="true">👋</span>
        </h1>
        <span>{activeSentence(title, subtitle)}</span>
      </div>
      <div className="topbar-actions">
        <button className="icon-button mobile-menu-trigger" type="button" aria-label="Abrir menu" onClick={onMenuClick}>
          <Menu size={19} />
        </button>
        <label className="search-shell compact-search">
          <Search size={18} />
          <input placeholder="Buscar aluno, treino ou exercício" />
        </label>
        <button className="icon-button glow-button" type="button" aria-label="Coach IA" onClick={onCoachClick}>
          <Sparkles size={19} />
        </button>
        <button className="icon-button" type="button" aria-label="Notificações">
          <Bell size={19} />
          <span className="notification-dot">3</span>
        </button>
        <div className="header-date">
          <CalendarDays size={19} />
          <div>
            <strong>21 de Junho, 2025</strong>
            <small>Sábado</small>
          </div>
        </div>
        <div className="profile-chip">
          {student?.avatar ? (
            <img src={student.avatar} alt={student.name} />
          ) : (
            <span>{user?.name?.slice(0, 2) || "TF"}</span>
          )}
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

function activeSentence(title, subtitle) {
  if (title === "Dashboard do Personal") {
    return "Disciplina hoje, liberdade amanhã.";
  }
  return subtitle;
}
