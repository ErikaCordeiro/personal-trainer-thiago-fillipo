import React, { useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Droplets,
  MessageCircle,
  Pencil,
  Target,
  Trophy,
  Wifi,
  X
} from "lucide-react";

const days = [
  ["26", "none"], ["27", "none"], ["28", "assessment"], ["29", "diet"], ["30", "none"], ["31", "checkin"], ["1", "none"],
  ["2", "workout"], ["3", "none"], ["4", "assessment"], ["5", "workout"], ["6", "none"], ["7", "checkin"], ["8", "workout"],
  ["9", "workout"], ["10", "workout"], ["11", "diet"], ["12", "workout"], ["13", "workout"], ["14", "none"], ["15", "workout"],
  ["16", "workout"], ["17", "workout"], ["18", "workout"], ["19", "workout"], ["20", "diet"], ["21", "checkin"], ["22", "workout"],
  ["23", "workout"], ["24", "workout"], ["25", "selected"], ["26", "workout"], ["27", "workout"], ["28", "none"], ["29", "workout"],
  ["30", "workout"], ["1", "none"], ["2", "none"], ["3", "none"], ["4", "none"], ["5", "none"], ["6", "none"]
];

const availableDays = [
  ["TER", "15", "JUL"],
  ["QUA", "16", "JUL"],
  ["QUI", "17", "JUL"],
  ["SEX", "18", "JUL"],
  ["SAB", "19", "JUL"],
  ["DOM", "20", "JUL"],
  ["SEG", "21", "JUL"]
];

const availableTimes = ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00", "18:00", "19:00", "20:00"];

const events = [
  ["Avaliação Física", "28/06", "Sábado - 09:00", "assessment"],
  ["Atualização da Dieta", "30/06", "Segunda - 10:00", "diet"],
  ["Treino Inferior B", "01/07", "Terça - 18:00", "workout"]
];

export default function StudentCalendar({ student }) {
  const [dayDetail, setDayDetail] = useState(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [attendance, setAttendance] = useState(false);
  const [serviceType, setServiceType] = useState("Online");
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedTime, setSelectedTime] = useState("18:00");
  const firstName = student?.name?.split(" ")[0] || "Erika";

  const selectedDate = useMemo(() => `${availableDays[selectedDay][1]}/07/2026`, [selectedDay]);

  return (
    <section className="student-calendar-page">
      <div className="student-calendar-header">
        <div>
          <h2>Calendário</h2>
          <p>Sua consistência e compromissos.</p>
        </div>
        <button type="button" aria-label="Notificações"><Bell size={22} /></button>
      </div>

      <article className="calendar-streak-card">
        <div className="calendar-lion-ring">
          <img src="/lion-juda-logo.png" alt="" />
        </div>
        <div>
          <span>sequência atual</span>
          <strong>18</strong>
          <p>dias seguidos</p>
          <small><CalendarDays size={14} /> Este mês</small>
        </div>
        <div className="calendar-streak-side">
          <p><Trophy size={16} /> Melhor sequência <strong>42 dias</strong></p>
          <p><Target size={16} /> Meta do mês <strong>20 check-ins</strong></p>
        </div>
      </article>

      <article className="calendar-month-card">
        <div className="calendar-card-title">
          <h3>Junho 2026</h3>
          <div>
            <button type="button" aria-label="mês anterior"><ChevronLeft size={18} /></button>
            <button type="button" aria-label="Próximo mês"><ChevronRight size={18} /></button>
          </div>
        </div>
        <div className="calendar-week-labels">
          {["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"].map((label) => <span key={label}>{label}</span>)}
        </div>
        <div className="calendar-contribution-grid">
          {days.map(([day, type], index) => (
            <button
              key={`${day}-${index}`}
              className={`calendar-day ${type}`}
              type="button"
              onClick={() => setDayDetail({ day, type })}
            >
              <span>{day}</span>
              <i />
            </button>
          ))}
        </div>
        <div className="calendar-legend">
          <span><i className="workout" /> Treino</span>
          <span><i className="assessment" /> Avaliação</span>
          <span><i className="diet" /> Dieta</span>
          <span><i className="checkin" /> Check-in</span>
          <span><i className="none" /> Sem atividade</span>
        </div>
      </article>

      <article className="calendar-return-card">
        <div className="calendar-card-title">
          <h3>Próximo retorno</h3>
          <button type="button" onClick={() => setScheduleOpen(true)}>Ver agenda</button>
        </div>
        <div className="calendar-return-body">
          <img className="calendar-personal-photo" src="/erika-gomes.jpeg" alt="Personal Thiago Filippo" />
          <div>
            <span>Personal</span>
            <strong>Thiago Filippo</strong>
            <p><CalendarDays size={15} /> 15/07/2026</p>
            <p><Clock size={15} /> 19:00</p>
            <p><Wifi size={15} /> Online</p>
          </div>
          <img className="calendar-return-lion" src="/lion-juda-logo.png" alt="" />
        </div>
        <button className="calendar-metal-button" type="button" onClick={() => setAttendance(true)}>
          {attendance ? <Check size={18} /> : null}
          {attendance ? "Presenca confirmada" : "Confirmar presenca"}
        </button>
        <div className="calendar-return-actions">
          <button type="button" onClick={() => setScheduleOpen(true)}><CalendarDays size={17} /> Agendar consulta</button>
          <button type="button" onClick={() => setScheduleOpen(true)}><Pencil size={17} /> Solicitar remarcação</button>
        </div>
      </article>

      <div className="student-calendar-grid">
        <article className="calendar-mini-card adherence">
          <h3>Aderência geral</h3>
          <div className="calendar-progress-ring"><strong>87%</strong></div>
          <p>Muito consistente. Continue assim para alcançar seus objetivos.</p>
        </article>

        <article className="calendar-mini-card goals">
          <h3>Metas do mês</h3>
          <GoalLine label="Treinos" value="18/20" progress="90%" className="workout" />
          <GoalLine label="Agua" value="87%" progress="87%" className="water" />
          <GoalLine label="Dieta" value="92%" progress="92%" className="diet" />
        </article>

        <article className="calendar-mini-card events">
          <h3>Próximos eventos</h3>
          {events.map(([title, date, detail, type]) => (
            <button key={title} type="button">
              <i className={type} />
              <span><strong>{title}</strong><small>{date} - {detail}</small></span>
              <ChevronRight size={17} />
            </button>
          ))}
        </article>

        <article className="calendar-mini-card message">
          <h3>Mensagem do seu Personal</h3>
          <div>
            <img src="/erika-gomes.jpeg" alt="" />
            <span><strong>Thiago Filippo</strong><small>Excelente semana, {firstName}. Sua consistência está excelente. Continue focada.</small></span>
          </div>
          <p>Última Atualização: 24/06/2026</p>
          <button type="button"><MessageCircle size={17} /> Enviar mensagem</button>
        </article>
      </div>

      {dayDetail && (
        <CalendarModal title={`Dia ${dayDetail.day}`} onClose={() => setDayDetail(null)}>
          <div className="calendar-day-detail">
            <p><DumbbellDot /> Treino realizado: Costas, ombros e glúteos</p>
            <p><Droplets size={17} /> Agua consumida: 2,1 L</p>
            <p><Target size={17} /> Aderência alimentar: 92%</p>
            <p><Check size={17} /> Check-in concluído</p>
            <p>Observacao do personal: mantenha o ritmo e priorize descanso.</p>
          </div>
        </CalendarModal>
      )}

      {scheduleOpen && (
        <CalendarModal title="Agendar consulta" subtitle="Escolha o melhor dia e horário para seu retorno." onClose={() => setScheduleOpen(false)}>
          <div className="schedule-personal-card">
            <img src="/erika-gomes.jpeg" alt="" />
            <div><span>Personal</span><strong>Thiago Filippo</strong></div>
            <img src="/lion-juda-logo.png" alt="" />
          </div>

          <div className="schedule-type-toggle">
            {["Online", "Presencial"].map((type) => (
              <button key={type} className={serviceType === type ? "active" : ""} type="button" onClick={() => setServiceType(type)}>
                {type === "Online" ? <Wifi size={18} /> : <Target size={18} />}
                {type}
              </button>
            ))}
          </div>

          <h4>1. Selecione o dia</h4>
          <div className="schedule-day-list">
            {availableDays.map(([week, day, month], index) => (
              <button key={`${day}-${month}`} className={selectedDay === index ? "active" : ""} type="button" onClick={() => setSelectedDay(index)}>
                <span>{week}</span><strong>{day}</strong><small>{month}</small>
              </button>
            ))}
          </div>

          <h4>2. Horarios disponiveis - {availableDays[selectedDay][1]} de Julho</h4>
          <div className="schedule-time-list">
            {availableTimes.length ? availableTimes.map((time) => (
              <button key={time} className={selectedTime === time ? "active" : ""} type="button" onClick={() => setSelectedTime(time)}>
                <Clock size={18} />
                {time}
                {selectedTime === time && <Check size={18} />}
              </button>
            )) : <p>Nenhum horário disponível no momento. Entre em contato com seu personal.</p>}
          </div>

          <div className="schedule-summary">
            <h4>3. Resumo da consulta</h4>
            <p><span>Data</span><strong>{selectedDate}</strong></p>
            <p><span>Horario</span><strong>{selectedTime}</strong></p>
            <p><span>Profissional</span><strong>Personal Thiago Filippo</strong></p>
            <p><span>Tipo de atendimento</span><strong>{serviceType}</strong></p>
          </div>

          <button className="calendar-metal-button" type="button" onClick={() => setScheduleOpen(false)}>Confirmar agendamento</button>
          <button className="calendar-ghost-button" type="button" onClick={() => setScheduleOpen(false)}>Cancelar</button>
          <p className="schedule-note">Ao confirmar, seu horário será reservado e você receberá uma notificação com todos os detalhes.</p>
        </CalendarModal>
      )}
    </section>
  );
}

function GoalLine({ label, value, progress, className }) {
  return (
    <div className="calendar-goal-line">
      <span>{label}<strong>{value}</strong></span>
      <i><b className={className} style={{ width: progress }} /></i>
    </div>
  );
}

function CalendarModal({ title, subtitle, children, onClose }) {
  return (
    <div className="student-calendar-modal-backdrop" role="presentation" onClick={onClose}>
      <div className="student-calendar-modal" role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <button type="button" className="student-calendar-modal-close" aria-label="Fechar" onClick={onClose}><X size={18} /></button>
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

function DumbbellDot() {
  return <span className="calendar-dumbbell-dot" />;
}



