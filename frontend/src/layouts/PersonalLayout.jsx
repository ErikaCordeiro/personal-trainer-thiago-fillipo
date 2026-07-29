import React, { useState } from "react";
import Header from "../components/Header.jsx";
import Sidebar, { personalNavItems } from "../components/Sidebar.jsx";

export default function PersonalLayout({
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
  onApproveStudent
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleCoachCapture = (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const text = button.textContent || "";
    const coachArea = button.closest(".coach-card, .coach-ia-panel, .coach-admin-actions, .assessment-coach-card, .ai-insights-student");
    if (coachArea || /coach ia|conversar|perguntar/i.test(text)) {
      event.preventDefault();
      onNavigate("coach");
    }
  };

  return (
    <div className={`app-shell personal-layout ${sidebarCollapsed ? "sidebar-is-collapsed" : ""}`}>
      <Sidebar
        activePage={activePage}
        navItems={personalNavItems}
        onNavigate={onNavigate}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onCollapsedChange={setSidebarCollapsed}
        profileName="Thiago Fillippo"
        profileRole="Personal trainer"
        profileInitials="TF"
        onLogout={onLogout}
      />
      <main className="main-panel personal-main" onClickCapture={handleCoachCapture}>
        <Header
          title={meta[0]}
          subtitle={meta[1]}
          user={session}
          student={student}
          variant="personal"
          onMenuClick={() => setSidebarOpen(true)}
          onLogout={onLogout}
          onCoachClick={() => onNavigate("coach")}
          notifications={notifications}
          onNotificationAction={onNotificationAction}
          onApproveStudent={onApproveStudent}
        />
        {children}
        <nav className="personal-mobile-nav" aria-label="Navegação mobile do personal">
          <button type="button" onClick={() => onNavigate("dashboard")}>Home</button>
          <button type="button" onClick={() => onNavigate("students")}>Alunos</button>
          <button className="mobile-coach" type="button" onClick={() => onNavigate("coach")}>
            <img src="/lion-juda-logo.png" alt="" />
            Coach IA
          </button>
          <button type="button" onClick={() => onNavigate("agenda")}>Agenda</button>
          <button type="button" onClick={() => setSidebarOpen(true)}>Mais</button>
        </nav>
      </main>
    </div>
  );
}

