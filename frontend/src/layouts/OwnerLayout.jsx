import React, { useState } from "react";
import { Activity, ChevronLeft, ChevronRight, LayoutDashboard, LockKeyhole, LogOut, Menu, Settings, ShieldCheck, Users, X } from "lucide-react";

const items = [
  ["dashboard", "Dashboard", LayoutDashboard], ["personals", "Personais", Users],
  ["logs", "Logs e atividades", Activity], ["settings", "Configurações", Settings], ["security", "Segurança", ShieldCheck],
];

export default function OwnerLayout({ session, activePage, onNavigate, onLogout, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = (page) => { onNavigate(page); setMobileOpen(false); };
  return <div className={`owner-shell ${collapsed ? "owner-collapsed" : ""}`}>
    <button className="owner-mobile-menu" type="button" aria-label="Abrir menu" onClick={() => setMobileOpen(true)}><Menu /></button>
    {mobileOpen && <button className="owner-overlay" aria-label="Fechar menu" onClick={() => setMobileOpen(false)} />}
    <aside className={`owner-sidebar ${mobileOpen ? "open" : ""}`}>
      <button className="owner-close-mobile" aria-label="Fechar menu" onClick={() => setMobileOpen(false)}><X /></button>
      <div className="owner-identity">
        {session.avatar_url ? <img src={session.avatar_url} alt="Erika Cordeiro" /> : <span>EC</span>}
        <div><strong>{session.name}</strong><small>SUPER USER</small></div>
      </div>
      <div className="owner-platform-brand"><strong>FITLAND</strong><small>Plataforma de gestão fitness</small></div>
      <nav aria-label="Navegação da dona">{items.map(([key, label, Icon]) => <button title={label} className={activePage === key ? "active" : ""} key={key} onClick={() => navigate(key)}><Icon /><span>{label}</span></button>)}</nav>
      <div className="owner-sidebar-footer">
        <button className="owner-logout" onClick={onLogout}><LogOut /><span>Sair da conta</span></button>
        <button className="owner-collapse" onClick={() => setCollapsed(v => !v)} aria-label={collapsed ? "Expandir menu" : "Recolher menu"}>{collapsed ? <ChevronRight /> : <ChevronLeft />}<span>Recolher</span></button>
      </div>
    </aside>
    <main className="owner-main">{children}</main>
  </div>;
}
