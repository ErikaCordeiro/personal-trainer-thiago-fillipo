import React, { useState } from "react";
import {
  Bell,
  Bot,
  CalendarDays,
  Check,
  ChevronRight,
  CreditCard,
  Database,
  DollarSign,
  Download,
  Dumbbell,
  FileText,
  Globe2,
  Image,
  KeyRound,
  Lock,
  Palette,
  RefreshCcw,
  Save,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sun,
  Moon,
  Trash2,
  Trophy,
  Upload,
  UserRound,
  Users
} from "lucide-react";

const studentConfig = ["Aprovacao automatica de alunos", "Exigir avaliação inicial", "Exigir foto de evolução", "Permitir agendamento online", "Permitir remarcacao"];
const adminNotifications = ["Novo aluno", "Consulta agendada", "Consulta remarcada", "Novo pagamento", "Novo arquivo enviado", "Nova mensagem"];
const aiSettings = ["Habilitar Coach IA", "Analise de progresso", "Analise financeira", "Recomendacoes inteligentes", "Insights de alunos"];
const privacySettings = ["Consentimento obrigatorio (LGPD)", "Compartilhamento de dados", "Armazenamento de exames"];

export default function PersonalSettings() {
  const [toggles, setToggles] = useState({
    automaticApproval: false,
    initialAssessment: true,
    progressPhoto: true,
    onlineSchedule: true,
    reschedule: true,
    newStudent: true,
    appointment: true,
    rescheduled: true,
    payment: true,
    file: true,
    message: true,
    coach: true,
    progressAi: true,
    financeAi: true,
    smartRecommendations: true,
    studentInsights: true,
    lgpd: true,
    dataSharing: true,
    examStorage: true
  });
  const [remakeLimit, setRemakeLimit] = useState("2");
  const [theme, setTheme] = useState("dark");
  const [toast, setToast] = useState("");
  const [armedAction, setArmedAction] = useState(null);

  const toggle = (key) => setToggles((current) => ({ ...current, [key]: !current[key] }));
  const notify = (text) => {
    setToast(text);
    window.setTimeout(() => setToast(""), 3200);
  };

  return (
    <section className="admin-settings-page">
      <header className="admin-settings-header">
        <div>
          <h2>Configurações</h2>
          <p>Gerencie todas as configurações do seu neg?cio.</p>
        </div>
        <div className="admin-settings-header-actions">
          <button type="button" aria-label="Notificacoes"><Bell size={21} /><i>3</i></button>
          <button type="button" className="admin-settings-admin-chip"><img src="/lion-juda-logo.png" alt="" /><span><strong>Thiago Filippo</strong><small>Administrador</small></span><ChevronRight size={17} /></button>
        </div>
      </header>

      {toast && <div className="admin-settings-toast"><Check size={17} /> {toast}</div>}

      <article className="admin-settings-hero">
        <div>
          <small>Personal</small>
          <h3>Thiago Filippo</h3>
          <span className="admin-plan-chip"><Trophy size={16} /> Plano Premium</span>
          <p>Disciplina - Foco - Propósito</p>
        </div>
        <HeroMetric icon={Users} value="128" label="Alunos ativos" trend="+12% este mês" />
        <HeroMetric icon={Dumbbell} value="482" label="Treinos concluidos" trend="+18% este mês" />
        <HeroMetric icon={DollarSign} value="R$ 24.580" label="Faturados este mês" trend="+15% este mês" />
        <img src="/lion-juda-logo.png" alt="Leao de Juda" />
      </article>

      <div className="admin-settings-grid">
        <SettingsCard number="1" title="Perfil Profissional" icon={UserRound} className="profile">
          <div className="admin-profile-card-body">
            <div className="admin-profile-photo"><img src="/lion-juda-logo.png" alt="Thiago Filippo" /><button type="button"><Upload size={15} /></button></div>
            <div className="admin-profile-lines">
              <strong>Thiago Filippo</strong>
              <span>CREF: 123456-G/SP</span>
              <span>thiagofilippo@personal.com</span>
              <span>(11) 98765-4321</span>
              <span>@thiagofilippo.personal</span>
              <span>www.thiagofilippo.com.br</span>
            </div>
          </div>
          <button className="admin-settings-wide" type="button" onClick={() => notify("Perfil profissional preparado para edicao.")}>Editar perfil</button>
        </SettingsCard>

        <SettingsCard number="2" title="Identidade da Marca" icon={Palette}>
          <div className="admin-brand-body">
            <div className="admin-brand-logo"><img src="/lion-juda-logo.png" alt="Logo" /></div>
            <div className="admin-brand-lines">
              <span><small>Nome do app</small><strong>Thiago Filippo App</strong></span>
              <span><small>Cor principal</small><i className="swatch dark" /></span>
              <span><small>Cor secundaria</small><i className="swatch silver" /></span>
              <span><small>Favicon</small><button type="button"><Image size={15} /></button></span>
              <span><small>Tela de login</small><button type="button"><Settings2 size={15} /></button></span>
            </div>
          </div>
          <button className="admin-settings-wide" type="button" onClick={() => notify("Central de marca aberta para personalizacao.")}>Personalizar marca</button>
        </SettingsCard>

        <SettingsCard number="3" title="Configuração de Alunos" icon={Users}>
          <ToggleList labels={studentConfig} keys={["automaticApproval", "initialAssessment", "progressPhoto", "onlineSchedule", "reschedule"]} toggles={toggles} onToggle={toggle} />
          <label className="admin-settings-inline-select"><span>Limite de remarcacoes</span><select value={remakeLimit} onChange={(event) => setRemakeLimit(event.target.value)}><option>1</option><option>2</option><option>3</option><option>Sem limite</option></select></label>
          <button className="admin-settings-wide" type="button" onClick={() => notify("Configurações de alunos salvas.")}>Salvar configurações</button>
        </SettingsCard>

        <SettingsCard number="4" title="Agenda" icon={CalendarDays}>
          <AdminLine label="Dias de atendimento" action="Configurar horários" onClick={() => notify("Configuração de horários aberta.")} />
          <label className="admin-settings-inline-select"><span>Intervalo entre consultas</span><select defaultValue="60"><option value="30">30 minutos</option><option value="45">45 minutos</option><option value="60">60 minutos</option></select></label>
          <AdminLine label="Feriados" action="Gerenciar" onClick={() => notify("Gerenciamento de feriados aberto.")} />
          <AdminLine label="Bloqueios" action="Gerenciar" onClick={() => notify("Bloqueios de agenda abertos.")} />
        </SettingsCard>

        <SettingsCard number="5" title="Financeiro" icon={CreditCard}>
          <div className="admin-settings-table-lines">
            <span><small>Pix</small><em>Ativado</em></span>
            <span><small>Mercado Pago</small><em>Ativado</em></span>
            <span><small>Stripe</small><b>Em breve</b></span>
            <span><small>Plano padrao</small><select defaultValue="mensal"><option value="mensal">Mensal</option><option value="trimestral">Trimestral</option></select></span>
            <span><small>Plano mensal</small><strong>R$ 149,90</strong></span>
            <span><small>Plano trimestral</small><strong>R$ 399,90</strong></span>
          </div>
          <button className="admin-settings-wide" type="button" onClick={() => notify("Configuração de pagamentos aberta.")}>Configurar pagamentos</button>
        </SettingsCard>

        <SettingsCard number="6" title="Notificacoes" icon={Bell}>
          <ToggleList labels={adminNotifications} keys={["newStudent", "appointment", "rescheduled", "payment", "file", "message"]} toggles={toggles} onToggle={toggle} />
          <button className="admin-settings-wide" type="button" onClick={() => notify("Preferencias de notificação atualizadas.")}>Gerenciar notifica??es</button>
        </SettingsCard>

        <SettingsCard number="7" title="Coach IA" icon={Bot}>
          <ToggleList labels={aiSettings} keys={["coach", "progressAi", "financeAi", "smartRecommendations", "studentInsights"]} toggles={toggles} onToggle={toggle} />
          <button className="admin-settings-wide" type="button" onClick={() => notify("Configurações do Coach IA abertas.")}>Configurar IA</button>
        </SettingsCard>

        <SettingsCard number="8" title="Aplicativo" icon={Smartphone}>
          <span className="admin-settings-label">Tema</span>
          <div className="admin-settings-segment"><button className={theme === "dark" ? "active" : ""} type="button" onClick={() => setTheme("dark")}><Moon size={17} /> Escuro</button><button className={theme === "light" ? "active" : ""} type="button" onClick={() => setTheme("light")}><Sun size={17} /> Claro</button></div>
          <label className="admin-settings-select"><span>Idioma</span><select defaultValue="pt"><option value="pt">Portugu?s (Brasil)</option></select></label>
          <button className="admin-settings-wide" type="button" onClick={() => notify("Preferencias do aplicativo salvas.")}>Salvar prefer?ncias</button>
        </SettingsCard>

        <SettingsCard number="9" title="Seguran?a" icon={Lock}>
          <div className="admin-security-lines connected-devices-grid">
            <button type="button"><Smartphone size={17} /> Dispositivos conectados <small>Navegador/PWA - sess?o atual - ?ltimo acesso hoje</small><ChevronRight size={16} /></button>
            <button type="button"><Globe2 size={17} /> Encerrar todas as outras sess?es <small>Dispon?vel quando houver m?ltiplos acessos</small><ChevronRight size={16} /></button>
            <button type="button"><ShieldCheck size={17} /> Autenticação em duas etapas <em>Estrutura preparada</em><ChevronRight size={16} /></button>
          </div>
        </SettingsCard>

        <SettingsCard number="10" title="Backup e Exportação" icon={Database}>
          <AdminLine label="Exportar alunos" action="Exportar" onClick={() => notify("Exportação de alunos iniciada.")} />
          <AdminLine label="Exportar avaliações" action="Exportar" onClick={() => notify("Exportação de avaliações iniciada.")} />
          <AdminLine label="Exportar financeiro" action="Exportar" onClick={() => notify("Exportação financeira iniciada.")} />
          <AdminLine label="Backup completo" action="Realizar backup" onClick={() => notify("Backup completo iniciado.")} />
          <p>?ltimo backup: 24/05/2026 ?s 03:15</p>
        </SettingsCard>

        <SettingsCard number="11" title="Termos e Privacidade" icon={FileText}>
          <ToggleList labels={privacySettings} keys={["lgpd", "dataSharing", "examStorage"]} toggles={toggles} onToggle={toggle} />
          <AdminLine label="Politica de privacidade" action="Editar" onClick={() => notify("Editor da politica aberto.")} />
          <button className="admin-settings-wide" type="button" onClick={() => notify("Central de termos aberta.")}>Gerenciar termos</button>
        </SettingsCard>

        <SettingsCard number="12" title="Estatisticas da Conta" icon={FileText}>
          <div className="admin-stats-lines">
            <span><small>Alunos ativos</small><strong>128</strong></span>
            <span><small>Avaliações realizadas</small><strong>342</strong></span>
            <span><small>Treinos cadastrados</small><strong>1.248</strong></span>
            <span><small>Dietas cadastradas</small><strong>892</strong></span>
            <span><small>Receita total</small><strong>R$ 24.580</strong></span>
            <span><small>Dias utilizando o sistema</small><strong>187 dias</strong></span>
          </div>
          <button className="admin-settings-wide" type="button">Ver relatórios completos</button>
        </SettingsCard>

        <article className="admin-settings-danger-zone">
          <h3>13. Zona de Seguran?a</h3>
          <div>
            <DangerAction icon={Trash2} title="Excluir conta" text="Esta ação não poder? ser desfeita." armed={armedAction === "delete"} onClick={() => setArmedAction(armedAction === "delete" ? null : "delete")} />
            <DangerAction icon={RefreshCcw} title="Resetar sistema" text="Todos os dados ser?o removidos." armed={armedAction === "reset"} onClick={() => setArmedAction(armedAction === "reset" ? null : "reset")} />
          </div>
        </article>

        <article className="admin-settings-footer">
          <img src="/lion-juda-logo.png" alt="Thiago Filippo" />
          <div><p>Voc? est? no controle do seu neg?cio. Cada configuração e um passo para transformar vidas e gerar resultados.</p><strong>Thiago Filippo</strong><small>Personal Trainer</small></div>
          <img src="/lion-juda-logo.png" alt="" />
        </article>
      </div>
    </section>
  );
}

function HeroMetric({ icon: Icon, value, label, trend }) {
  return <div className="admin-settings-hero-metric"><Icon size={31} /><strong>{value}</strong><span>{label}</span><small>{trend}</small></div>;
}

function SettingsCard({ number, title, icon: Icon, children, className = "" }) {
  return <article className={`admin-settings-card ${className}`}><h3><span>{number}.</span> {title}</h3>{children}</article>;
}

function ToggleList({ labels, keys, toggles, onToggle }) {
  return <div className="admin-toggle-list">{labels.map((label, index) => <label key={label}><span>{label}</span><button type="button" className={toggles[keys[index]] ? "on" : ""} onClick={() => onToggle(keys[index])}><i /></button></label>)}</div>;
}

function AdminLine({ label, action, onClick }) {
  return <div className="admin-settings-line"><span>{label}</span><button type="button" onClick={onClick}>{action}</button></div>;
}

function DangerAction({ icon: Icon, title, text, armed, onClick }) {
  return <button className={armed ? "armed" : ""} type="button" onClick={onClick}><Icon size={25} /><span><strong>{armed ? `Confirmar ${title.toLowerCase()}` : title}</strong><small>{text}</small></span></button>;
}