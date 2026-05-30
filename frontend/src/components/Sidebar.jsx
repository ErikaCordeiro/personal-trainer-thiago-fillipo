import React, { useState } from "react";
import {
  Apple,
  BarChart3,
  Bot,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  Dumbbell,
  FileText,
  Home,
  Info,
  LineChart,
  Menu,
  MessageCircle,
  Settings,
  Users
} from "lucide-react";
import LionLogo from "./LionLogo.jsx";

export const personalNavItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "students", label: "Alunos", icon: Users },
  { id: "workout-builder", label: "Treinos", icon: Dumbbell },
  { id: "diet", label: "Dietas", icon: Apple },
  { id: "assessments", label: "AvaliaÃ§Ãµes", icon: ClipboardCheck },
  { id: "progress", label: "Progresso", icon: LineChart },
  { id: "finance", label: "Financeiro", icon: CreditCard },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "chat", label: "Mensagens", icon: MessageCircle },
  { id: "reports", label: "RelatÃ³rios", icon: FileText },
  { id: "coach", label: "Coach IA", icon: Bot },
  { id: "about-personal", label: "Sobre o Personal", icon: Info },
  { id: "settings", label: "ConfiguraÃ§Ãµes", icon: Settings }
];

export const studentNavItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "student-view", label: "Treino", icon: Dumbbell },
  { id: "diet", label: "Dieta", icon: Apple },
  { id: "assessments", label: "AvaliaÃ§Ãµes", icon: ClipboardCheck },
  { id: "progress", label: "Progresso", icon: BarChart3 },
  { id: "messages", label: "Mensagens", icon: MessageCircle },
  { id: "files", label: "Arquivos", icon: FileText },
  { id: "calendar", label: "CalendÃ¡rio", icon: CalendarDays },
  { id: "coach", label: "Coach IA", icon: Bot },
  { id: "about-personal", label: "Sobre o Personal", icon: Info },
  { id: "settings", label: "ConfiguraÃ§Ãµes", icon: Settings }
];

export default function Sidebar({
  activePage,
  onNavigate,
  mobileOpen = false,
  onClose,
  onCollapsedChange,
  navItems = personalNavItems,
  profileName = "Thiago Filippo",
  profileRole = "Personal trainer",
  profileInitials = "TF"
}) {
  const [collapsed, setCollapsed] = useState(false);
  const effectiveCollapsed = collapsed && !mobileOpen;
  const inactive = new Set(["finance", "agenda", "chat", "reports", "settings", "profile", "messages", "files", "calendar"]);

  const handleNavigate = (item) => {
    onNavigate(inactive.has(item.id) ? "dashboard" : item.id);
  };

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      const nextValue = !value;
      onCollapsedChange?.(nextValue);
      return nextValue;
    });
  };

  return (
    <>
      <button
        className={`sidebar-overlay ${mobileOpen ? "show" : ""}`}
        type="button"
        aria-label="Fechar menu"
        onClick={onClose}
      />
      <aside className={`sidebar ${effectiveCollapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <button
            className="sidebar-toggle menu-toggle"
            type="button"
            aria-label="Alternar menu"
            onClick={toggleCollapsed}
          >
            <Menu size={20} />
          </button>
          <LionLogo compact={effectiveCollapsed} />
        </div>

        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activePage === item.id ? "active" : ""}`}
                onClick={() => handleNavigate(item)}
                type="button"
                title={effectiveCollapsed ? item.label : undefined}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-footer">
          <div className="sidebar-profile">
            <span>{profileInitials}</span>
            <div>
              <strong>{profileName}</strong>
              <small>{profileRole}</small>
            </div>
          </div>

          <div className="coach-card">
            <Bot size={20} />
            <div>
              <strong>Coach IA</strong>
              <span>Pergunte sobre treinos, dieta, evoluÃ§Ã£o e mais.</span>
            </div>
            <button type="button" onClick={() => onNavigate("coach")}>Conversar</button>
          </div>

          <button
            className="sidebar-toggle collapse-toggle"
            type="button"
            onClick={toggleCollapsed}
            aria-label={effectiveCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            {effectiveCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            <span>{effectiveCollapsed ? "Expandir" : "Recolher"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
