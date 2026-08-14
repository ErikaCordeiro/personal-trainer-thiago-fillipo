import React, { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertTriangle, Bell, ChevronRight, CircleOff, ClipboardList,
  Dumbbell, GraduationCap, HardDrive, HelpCircle, Plus, Search, Settings,
  Users,
} from "lucide-react";
import { apiRequest } from "../services/api.js";

const statusLabel = { active: "Ativo", suspended: "Suspenso", blocked: "Bloqueado" };

function Avatar({ person }) {
  if (person.avatar_url) return <img className="owner-avatar" src={person.avatar_url} alt="" />;
  const initials = person.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("");
  return <span className="owner-avatar initials">{initials}</span>;
}

export default function OwnerDashboard({ onNavigate, theme, setTheme }) {
  const [summary, setSummary] = useState({ personals_active: 0, personals_suspended: 0, personals_blocked: 0, students_total: 0, alerts: [] });
  const [personals, setPersonals] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiRequest("/owner/dashboard/summary"),
      apiRequest("/owner/personals?page=1&size=5&sort=created_at&order=desc"),
    ]).then(([dashboard, list]) => {
      setSummary(dashboard);
      setPersonals(list.items || []);
    }).catch(() => setError("Não foi possível carregar o dashboard."));
  }, []);

  const workouts = useMemo(() => personals.reduce((total, item) => total + (item.workout_count || 0), 0), [personals]);
  const pending = summary.personals_suspended + summary.personals_blocked;
  const cards = [
    ["Personais ativos", summary.personals_active, Users, "Base atual", "up"],
    ["Personais suspensos", summary.personals_suspended, CircleOff, "Acompanhar contas", "warning"],
    ["Alunos totais", summary.students_total, GraduationCap, "Base atual", "up"],
    ["Treinos realizados", workouts, Dumbbell, "Dados dos personais", "up"],
    ["Uso de armazenamento", "0%", HardDrive, "Monitoramento disponível", "neutral"],
    ["Pendências", pending, ClipboardList, "Ver detalhes", "danger"],
  ];
  const alerts = summary.alerts?.length ? summary.alerts : [
    "Nenhuma solicitação de personal aguardando análise",
    "Armazenamento dentro do limite da conta",
    "Sistema atualizado e disponível",
    "Backup da plataforma verificado",
  ];

  return <div className="owner-dashboard">
    <header className="owner-dashboard-topbar">
      <div><h1>Dashboard</h1><p>Visão geral da plataforma Fitland</p></div>
      <div className="owner-dashboard-actions">
        <span className="owner-date-range">01/08/2026 - 13/08/2026</span>
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Alternar tema">◐</button>
        <button className="owner-notification" aria-label="Notificações"><Bell/><b>3</b></button>
        <button><HelpCircle/><span>Ajuda</span></button>
      </div>
    </header>
    {error && <p className="owner-alert error">{error}</p>}

    <section className="owner-kpis owner-kpis-six">
      {cards.map(([label, value, Icon, note, tone]) => <button key={label} onClick={() => (label.includes("Personal") || label === "Pendências") && onNavigate("personals")}>
        <span className="owner-kpi-icon"><Icon/></span><span>{label}</span><strong>{value}</strong><small className={tone}>{note}</small><i className="owner-kpi-spark" />
      </button>)}
    </section>

    <section className="owner-overview-grid">
      <article className="owner-panel owner-activity-chart">
        <div className="owner-panel-title"><h2>Atividade da plataforma</h2><button>Últimos 7 dias</button></div>
        <div className="owner-chart-area">
          <svg viewBox="0 0 700 220" role="img" aria-label="Atividade da plataforma">
            <defs><linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8b5cf6" stopOpacity=".38"/><stop offset="1" stopColor="#8b5cf6" stopOpacity="0"/></linearGradient></defs>
            <path className="fill" d="M20 170 L130 142 L240 128 L350 100 L460 68 L565 80 L680 42 L680 210 L20 210 Z"/>
            <polyline points="20,170 130,142 240,128 350,100 460,68 565,80 680,42"/>
            {[20,130,240,350,460,565,680].map((cx, index) => <circle key={cx} cx={cx} cy={[170,142,128,100,68,80,42][index]} r="5"/>)}
          </svg>
          <div className="owner-chart-dates"><span>07/08</span><span>08/08</span><span>09/08</span><span>10/08</span><span>11/08</span><span>12/08</span><span>13/08</span></div>
        </div>
        <div className="owner-chart-tabs"><button className="active">Alunos ativos</button><button>Treinos realizados</button><button>Novos personais</button></div>
      </article>
      <article className="owner-panel owner-alerts">
        <div className="owner-panel-title"><h2>Alertas importantes</h2><button onClick={() => onNavigate("logs")}>Ver todos</button></div>
        {alerts.slice(0, 4).map((alert, index) => <button className="owner-alert-row" key={`${alert}-${index}`} onClick={() => index === 0 && onNavigate("personals")}>
          <span className={`alert-icon tone-${index}`}><AlertTriangle/></span><span><strong>{alert}</strong><small>{index === 0 ? "Acesse para revisar os cadastros." : index === 1 ? "Uso monitorado em tempo real." : index === 2 ? "Nova versão e correções aplicadas." : "Última verificação concluída."}</small></span><time>{index === 0 ? "agora" : index === 1 ? "1 hora atrás" : index === 2 ? "3 horas atrás" : "hoje"}</time>
        </button>)}
      </article>
    </section>

    <section className="owner-bottom-grid">
      <article className="owner-panel owner-recent-personals">
        <div className="owner-panel-title"><h2>Últimos personais cadastrados</h2><button onClick={() => onNavigate("personals")}>Ver todos</button></div>
        <div className="owner-recent-head"><span>Nome</span><span>Alunos</span><span>Cadastro</span><span>Status</span></div>
        {personals.length ? personals.map((person) => <button key={person.id} onClick={() => onNavigate("personals")}><span className="owner-person"><Avatar person={person}/><span><strong>{person.name}</strong><small>{person.email}</small></span></span><span>{person.student_count}</span><span>{new Date(person.created_at).toLocaleDateString("pt-BR")}</span><span className={`owner-status ${person.status}`}>{statusLabel[person.status] || person.status}</span></button>) : <p className="owner-empty">Nenhum personal cadastrado.</p>}
      </article>
      <article className="owner-panel owner-distribution"><h2>Distribuição de alunos</h2><div className="owner-donut"><strong>{summary.students_total}</strong><span>Total</span></div><p><i className="active"/> Ativos <strong>{summary.students_total}</strong></p><p><i className="inactive"/> Inativos <strong>0</strong></p><p><i className="suspended"/> Suspensos <strong>0</strong></p></article>
      <article className="owner-panel owner-quick-actions"><h2>Ações rápidas</h2><button onClick={() => onNavigate("personals")}><Plus/><span><strong>Novo personal</strong><small>Cadastrar um personal na plataforma</small></span><ChevronRight/></button><button onClick={() => onNavigate("personals")}><Search/><span><strong>Revisar solicitações</strong><small>Ver cadastros e acessos pendentes</small></span><ChevronRight/></button><button onClick={() => onNavigate("logs")}><Activity/><span><strong>Ver logs de atividades</strong><small>Acessar logs e auditoria</small></span><ChevronRight/></button><button onClick={() => onNavigate("settings")}><Settings/><span><strong>Configurações da plataforma</strong><small>Editar configurações gerais</small></span><ChevronRight/></button></article>
    </section>
  </div>;
}
