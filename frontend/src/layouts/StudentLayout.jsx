import React, { useState } from "react";
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
  onNotificationAction
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleCoachCapture = (event) => {
    const button = event.target.closest?.("button");
    if (!button) return;
    const text = button.textContent || "";
    const coachArea = button.closest?.(".coach-card, .student-coach-panel, .food-coach-card, .assessment-coach-card, .student-coach-question, .ai-insights-student");
    if (coachArea || /coach ia|conversar|perguntar/i.test(text)) {
      event.preventDefault();
      onNavigate("coach");
    }
  };

  return (
    <div className={`app-shell student-layout-shell ${sidebarCollapsed ? "sidebar-is-collapsed" : ""}`}>
      <Sidebar
        activePage={activePage}
        navItems={studentNavItems}
        onNavigate={onNavigate}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onCollapsedChange={setSidebarCollapsed}
        profileName={student?.name || session?.name || "Aluno"}
        profileRole="Aluno"
        profileInitials={(student?.name || session?.name || "Aluno").slice(0, 2)}
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
          <button type="button" onClick={() => onNavigate("dashboard")}>Home</button>
          <button type="button" onClick={() => onNavigate("student-view")}>Treino</button>
          <button className="bottom-coach" type="button" onClick={() => onNavigate("coach")}>
            <img src="/lion-juda-logo.png" alt="" />
            Coach IA
          </button>
          <button type="button" onClick={() => onNavigate("diet")}>Dieta</button>
          <button type="button" onClick={() => onNavigate("progress")}>Perfil</button>
        </nav>
      </main>
    </div>
  );
}

