import React from "react";
import { Activity, Dumbbell, Home, LineChart, Users } from "lucide-react";
import LionLogo from "./LionLogo.jsx";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "students", label: "Alunos", icon: Users },
  { id: "workout-builder", label: "Treinos", icon: Dumbbell },
  { id: "student-view", label: "Área do aluno", icon: Activity },
  { id: "progress", label: "Progresso", icon: LineChart }
];

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <LionLogo />
      <nav className="nav-list">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? "active" : ""}`}
              onClick={() => onNavigate(item.id)}
              type="button"
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <span>Plano Elite</span>
        <strong>94% de aderência</strong>
      </div>
    </aside>
  );
}
