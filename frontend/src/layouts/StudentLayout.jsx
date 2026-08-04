import React, { useState } from "react";
import { BarChart3, CalendarDays, Dumbbell, Home, Utensils } from "lucide-react";
import Header from "../components/Header.jsx";
import Sidebar, { studentNavItems } from "../components/Sidebar.jsx";

export default function StudentLayout({
  activePage,
  children,
  meta,
  onNavigate,
  onLogout,
  session,
  sidebarOpen,
  setSidebarOpen,
  student,
  notifications,
  onNotificationAction,
  branding
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleCoachCapture = (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const text = button.textContent || "";
    const coachArea = button.closest(".coach-card, .student-coach-panel, .food-coach-card, .assessment-coach-card, .student-coach-question, .ai-insights-student");
    if (coachArea || /coach ia|assistente fitness|conversar|perguntar/i.test(text)) {
      event.preventDefault();
      onNavigate("coach");
    }
  };

  return (
    <div className={`app-shell student-layout-shell ${sidebarCollapsed ? "sidebar-is-collapsed" : ""}`} style={{ "--brand-primary": branding?.primary_color || "#050505", "--brand-secondary": branding?.secondary_color || "#C0C0C0" }}>
      <Sidebar
        activePage={activePage}
        navItems={studentNavItems}
        onNavigate={onNavigate}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onCollapsedChange={setSidebarCollapsed}
        profileName={student?.name || session?.name || "Aluno"}
        branding={branding}
        profileRole="Aluno"
        profileInitials={(student?.name || session?.name || "Aluno").slice(0, 2)}
        onLogout={onLogout}
      />
      <main className="main-panel student-main" onClickCapture={handleCoachCapture}>
        <Header
          title={meta[0]}
          subtitle={meta[1]}
          user={session}
          student={student}
          variant="student"
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={onLogout}
          onCoachClick={() => onNavigate("coach")}
          notifications={notifications}
          onNotificationAction={onNotificationAction}
        />
        {children}
        <nav className="bottom-nav student-bottom-nav" aria-label="Navegação principal do aluno">
          {[
            ["dashboard", "Início", Home],
            ["student-view", "Treinos", Dumbbell],
            ["diet", "Dieta", Utensils],
            ["calendar", "Calendário", CalendarDays],
            ["progress", "Progresso", BarChart3]
          ].map(([page, label, Icon]) => (
            <button
              key={page}
              className={activePage === page ? "active" : ""}
              type="button"
              onClick={() => onNavigate(page)}
              aria-label={label}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
}
