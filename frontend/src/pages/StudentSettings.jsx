import React, { useState } from "react";
import {
  Bell,
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  CreditCard,
  Dumbbell,
  Droplets,
  Globe2,
  HeartPulse,
  KeyRound,
  Link2,
  Lock,
  LogOut,
  Moon,
  Pencil,
  Shield,
  Smartphone,
  Sun,
  Target,
  Trash2,
  Trophy,
  UserRound,
  Watch
} from "lucide-react";

const notificationItems = [
  { id: "training", label: "Lembrete de treino", icon: Dumbbell },
  { id: "water", label: "Lembrete de água", icon: Droplets },
  { id: "meal", label: "Lembrete de refeição", icon: HeartPulse },
  { id: "messages", label: "Novas mensagens", icon: Bell },
  { id: "assessments", label: "Avaliações", icon: Target },
  { id: "calendar", label: "Consultas agendadas", icon: CalendarDays }
];

const integrations = [
  { label: "Apple Health", icon: HeartPulse },
  { label: "Google Fit", icon: Target },
  { label: "Samsung Health", icon: Watch },
  { label: "Garmin", icon: Watch },
  { label: "Smartwatch", icon: Smartphone }
];

export default function StudentSettings({ student }) {
  const [profile, setProfile] = useState({
    name: student?.name || "Erika Gomes",
    email: "erika.gomes@email.com",
    phone: "(11) 98765-4321",
    birthday: "15/08/1996"
  });
  const [editing, setEditing] = useState(false);
  const [notifications, setNotifications] = useState({
    training: true,
    water: true,
    meal: true,
    messages: true,
    assessments: true,
    calendar: true
  });
  const [privacy, setPrivacy] = useState({ photos: true, exams: true, assessments: true });
  const [reminder, setReminder] = useState("30 minutos antes");
  const [message, setMessage] = useState("");
  const [deleteArmed, setDeleteArmed] = useState(false);

  const requestChange = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 3200);
  };

  const updateProfile = (field, value) => setProfile((current) => ({ ...current, [field]: value }));

  return (
    <section className="student-settings-page">
      <header className="student-settings-header">
        <div>
          <h2>Configurações</h2>
          <p>Gerencie sua conta e preferências.</p>
        </div>
        <div className="student-settings-safe-card">
          <Shield size={30} />
          <span><strong>Seus dados estão seguros</strong><small>Compartilhados apenas com o Personal Thiago Fillippo.</small></span>
        </div>
      </header>

      {message && <div className="student-settings-toast"><Check size={17} /> {message}</div>}

      <div className="student-settings-grid">
        <article className="student-settings-card profile-card span-5">
          <SectionTitle icon={UserRound} title="Perfil" />
          <div className="settings-profile-body">
            <div className="settings-avatar-wrap">
              <img src={student?.avatar || "/erika-gomes.jpeg"} alt={profile.name} />
              <button type="button" aria-label="Alterar foto"><Camera size={16} /></button>
            </div>
            <div className="settings-profile-fields">
              <EditableField label="Nome" value={profile.name} editing={editing} onChange={(value) => updateProfile("name", value)} />
              <EditableField label="E-mail" value={profile.email} editing={editing} onChange={(value) => updateProfile("email", value)} />
              <EditableField label="Telefone" value={profile.phone} editing={editing} onChange={(value) => updateProfile("phone", value)} />
              <EditableField label="Data de nascimento" value={profile.birthday} editing={editing} onChange={(value) => updateProfile("birthday", value)} />
            </div>
          </div>
          <button className="settings-wide-button" type="button" onClick={() => setEditing((value) => !value)}>
            <Pencil size={17} /> {editing ? "Salvar perfil" : "Editar perfil"}
          </button>
        </article>

        <article className="student-settings-card journey-card span-7">
          <SectionTitle icon={Trophy} title="Minha Jornada" />
          <div className="settings-journey-body">
            <div className="settings-journey-list">
              <JourneyItem icon={CalendarDays} label="Aluno desde" value="10/03/2026" />
              <JourneyItem icon={Dumbbell} label="Objetivo atual" value="Hipertrofia" />
              <JourneyItem icon={UserRound} label="Personal" value="Thiago Fillippo" />
              <JourneyItem icon={Target} label="Dias de acompanhamento" value="187 dias" />
            </div>
            <img src="/lion-juda-logo.png" alt="Leao de Juda" />
          </div>
        </article>

        <article className="student-settings-card objectives-card span-6">
          <SectionTitle icon={Target} title="Objetivos" />
          <div className="settings-goal-chip"><Dumbbell size={18} /> Hipertrofia</div>
          <div className="settings-two-cols">
            <span><small>Meta</small><strong>82 kg</strong><em>Peso desejado</em></span>
            <span><small>Data estimada</small><strong>30/09/2026</strong><em>Data da meta</em></span>
          </div>
          <button className="settings-wide-button" type="button" onClick={() => requestChange("Solicitacao enviada ao personal.")}>Solicitar alteracao ao personal</button>
          <p>A alteracao do objetivo deve ser feita com o seu personal.</p>
        </article>

        <article className="student-settings-card notifications-card span-6">
          <SectionTitle icon={Bell} title="Notificações" />
          <div className="settings-toggle-list">
            {notificationItems.map((item) => {
              const Icon = item.icon;
              return (
                <label key={item.id}>
                  <span><Icon size={18} /> {item.label}</span>
                  <button type="button" className={notifications[item.id] ? "on" : ""} onClick={() => setNotifications((current) => ({ ...current, [item.id]: !current[item.id] }))} aria-label={item.label}><i /></button>
                </label>
              );
            })}
          </div>
          <button className="settings-wide-button" type="button" onClick={() => requestChange("Preferências de notificação atualizadas.")}>Gerenciar preferências</button>
        </article>

        <article className="student-settings-card span-4 schedule-card">
          <SectionTitle icon={CalendarDays} title="Agenda" />
          <label className="settings-select-label">
            <span>Lembretes de compromissos</span>
            <select value={reminder} onChange={(event) => setReminder(event.target.value)}>
              <option>15 minutos antes</option>
              <option>30 minutos antes</option>
              <option>1 hora antes</option>
              <option>1 dia antes</option>
            </select>
          </label>
          <p>Você recebera um lembrete antes de cada compromisso agendado.</p>
        </article>

        <article className="student-settings-card span-4 hydration-card">
          <SectionTitle icon={Droplets} title="Hidratação" />
          <span className="settings-big-number">2,5 L</span>
          <p>Meta diária de água calculada com base na sua avaliação física.</p>
          <button className="settings-wide-button" type="button" onClick={() => requestChange("Pedido de recalculo de meta enviado.")}>Solicitar recalcular meta</button>
        </article>

        <article className="student-settings-card span-4 privacy-card">
          <SectionTitle icon={Lock} title="Privacidade" />
          <label className="settings-select-label"><span>Quem pode ver meus dados?</span><input value="Apenas eu e meu personal" readOnly /></label>
          <div className="settings-check-list">
            <CheckLine label="Compartilhar fotos de evolução" checked={privacy.photos} onClick={() => setPrivacy((value) => ({ ...value, photos: !value.photos }))} />
            <CheckLine label="Compartilhar exames" checked={privacy.exams} onClick={() => setPrivacy((value) => ({ ...value, exams: !value.exams }))} />
            <CheckLine label="Compartilhar avaliações" checked={privacy.assessments} onClick={() => setPrivacy((value) => ({ ...value, assessments: !value.assessments }))} />
          </div>
          <button className="settings-wide-button" type="button" onClick={() => requestChange("Privacidade atualizada.")}>Gerenciar privacidade</button>
        </article>

        <article className="student-settings-card span-4 app-card">
          <SectionTitle icon={Smartphone} title="Aplicativo" />
          <span className="settings-label">Tema</span>
          <div className="settings-segment"><button className="active" type="button"><Moon size={17} /> Escuro</button><button type="button"><Sun size={17} /> Claro</button></div>
          <label className="settings-select-label"><span>Idioma</span><select defaultValue="pt"><option value="pt">Português (Brasil)</option></select></label>
        </article>

        <article className="student-settings-card span-4 integrations-card">
          <SectionTitle icon={Link2} title="Integrações futuras" />
          <div className="settings-integration-list">
            {integrations.map((item) => {
              const Icon = item.icon;
              return <span key={item.label}><Icon size={17} /> {item.label}<em>Em breve</em></span>;
            })}
          </div>
        </article>

        <article className="student-settings-card span-4 account-card">
          <SectionTitle icon={CreditCard} title="Conta" />
          <div className="settings-account-lines">
            <span><small>Plano atual</small><strong>Premium</strong></span>
            <span><small>Próxima renovação</small><strong>10/06/2026</strong></span>
            <span><small>Próximo pagamento</small><strong>R$ 89,90</strong></span>
          </div>
          <button className="settings-wide-button" type="button" onClick={() => requestChange("Area de assinatura preparada para integracao.")}>Gerenciar assinatura <ChevronRight size={17} /></button>
        </article>

        <article className="student-settings-card security-card span-12">
          <SectionTitle icon={Shield} title="Segurança da conta" />
          <div className="settings-security-grid connected-devices-grid">
            <button type="button"><Smartphone size={20} /><span><strong>Dispositivos conectados</strong><small>iPhone/PWA - sessão atual - último acesso hoje - localização aproximada indisponível</small></span><ChevronRight size={18} /></button>
            <button type="button" onClick={() => requestChange("Outras sessões serão encerradas quando houver múltiplos dispositivos conectados.")}><KeyRound size={20} /><span><strong>Encerrar todas as outras sessões</strong><small>Mantenha somente este acesso ativo</small></span><ChevronRight size={18} /></button>
          </div>
        </article>

        <article className="student-settings-footer span-12">
          <div>
            <p>Cada configuração é um passo para uma jornada ainda mais personalizada e resultados extraordinários.</p>
            <strong>Thiago Fillippo</strong>
            <small>Personal Trainer</small>
          </div>
          <img className="settings-personal-photo" src="/lion-juda-logo.png" alt="Thiago Fillippo" />
          <img className="settings-footer-lion" src="/lion-juda-logo.png" alt="" />
        </article>
      </div>
    </section>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return <div className="settings-section-title"><Icon size={21} /><h3>{title}</h3></div>;
}

function EditableField({ label, value, editing, onChange }) {
  return (
    <label className="settings-editable-field">
      <span>{label}</span>
      {editing ? <input value={value} onChange={(event) => onChange(event.target.value)} /> : <strong>{value}</strong>}
    </label>
  );
}

function JourneyItem({ icon: Icon, label, value }) {
  return <span className="settings-journey-item"><Icon size={18} /><small>{label}</small><strong>{value}</strong></span>;
}

function CheckLine({ label, checked, onClick }) {
  return <button type="button" className={checked ? "checked" : ""} onClick={onClick}><i>{checked && <Check size={14} />}</i>{label}</button>;
}