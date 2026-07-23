import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dumbbell,
  MessageCircle,
  Pencil,
  Target,
  Trophy,
  Wifi,
  X
} from "lucide-react";
import {
  calculateBestWorkoutStreak,
  calculateCurrentWorkoutStreak,
  completedWorkoutsInMonth,
  formatDateBR,
  formatMonthYear,
  getMonthlyWorkoutGoal,
  loadCalendarEvents,
  loadWorkoutHistory,
  saveCalendarEvent,
  toLocalDateKey,
  workoutEventsFromHistory
} from "../utils/activityData.js";

const weekLabels = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
const availableDays = [
  ["TER", "15", "JUL"],
  ["QUA", "16", "JUL"],
  ["QUI", "17", "JUL"],
  ["SEX", "18", "JUL"],
  ["SÁB", "19", "JUL"],
  ["DOM", "20", "JUL"],
  ["SEG", "21", "JUL"]
];
const availableTimes = ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00", "18:00", "19:00", "20:00"];
const eventLabels = {
  workout: "Treino concluído",
  assessment: "Avaliação",
  diet: "Dieta",
  checkin: "Check-in",
  consultation: "Consulta",
  personal: "Evento"
};

function buildMonthDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - startOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      date,
      dateKey: toLocalDateKey(date),
      day: date.getDate(),
      inMonth: date.getMonth() === month
    };
  });
}

export default function StudentCalendar({ student }) {
  const firstName = student?.name?.split(" ")[0] || "Erika";
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [selectedKey, setSelectedKey] = useState(() => toLocalDateKey(new Date()));
  const [history, setHistory] = useState(() => loadWorkoutHistory());
  const [customEvents, setCustomEvents] = useState(() => loadCalendarEvents());
  const [dayDetail, setDayDetail] = useState(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [attendance, setAttendance] = useState(false);
  const [serviceType, setServiceType] = useState("Online");
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedTime, setSelectedTime] = useState("18:00");

  useEffect(() => {
    const refresh = () => {
      setHistory(loadWorkoutHistory());
      setCustomEvents(loadCalendarEvents());
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const workoutEvents = useMemo(() => workoutEventsFromHistory(history), [history]);
  const events = useMemo(() => [...workoutEvents, ...customEvents], [workoutEvents, customEvents]);
  const eventsByDay = useMemo(() => {
    return events.reduce((map, event) => {
      if (!map.has(event.dateKey)) map.set(event.dateKey, []);
      map.get(event.dateKey).push(event);
      return map;
    }, new Map());
  }, [events]);

  const monthDays = useMemo(() => buildMonthDays(monthDate), [monthDate]);
  const todayKey = toLocalDateKey(new Date());
  const currentStreak = useMemo(() => calculateCurrentWorkoutStreak(history), [history]);
  const bestStreak = useMemo(() => calculateBestWorkoutStreak(history), [history]);
  const monthWorkouts = useMemo(() => completedWorkoutsInMonth(history, monthDate), [history, monthDate]);
  const monthlyGoal = getMonthlyWorkoutGoal();
  const selectedEvents = eventsByDay.get(selectedKey) || [];
  const selectedDate = useMemo(() => `${availableDays[selectedDay][1]}/07/2026`, [selectedDay]);

  function changeMonth(delta) {
    setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  function goToday() {
    const now = new Date();
    setMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedKey(toLocalDateKey(now));
  }

  function openDay(day) {
    setSelectedKey(day.dateKey);
    setDayDetail({ ...day, events: eventsByDay.get(day.dateKey) || [] });
  }

  function confirmSchedule() {
    const eventDate = new Date(2026, 6, Number(availableDays[selectedDay][1]));
    const event = {
      id: `consultation-${eventDate.getTime()}-${selectedTime}`,
      type: "consultation",
      date: eventDate.toISOString(),
      dateKey: toLocalDateKey(eventDate),
      title: "Consulta com Personal Thiago Filippo",
      detail: `${serviceType} às ${selectedTime}`,
      time: selectedTime
    };
    saveCalendarEvent(event);
    setCustomEvents(loadCalendarEvents());
    setScheduleOpen(false);
  }

  return (
    <section className="student-calendar-page">
      <div className="student-calendar-header">
        <div>
          <h2>Calendário</h2>
          <p>Sua consistência e compromissos reais.</p>
        </div>
        <button type="button" aria-label="Notificações"><Bell size={22} /></button>
      </div>

      <article className="calendar-streak-card">
        <div className="calendar-lion-ring">
          <img src="/lion-juda-logo.png" alt="" />
        </div>
        <div>
          <span>Sequência atual</span>
          <strong>{currentStreak}</strong>
          <p>{currentStreak === 1 ? "dia seguido" : "dias seguidos"}</p>
          <small><CalendarDays size={14} /> {monthWorkouts.length} treino(s) concluído(s) este mês</small>
        </div>
        <div className="calendar-streak-side">
          <p><Trophy size={16} /> Melhor sequência <strong>{bestStreak} {bestStreak === 1 ? "dia" : "dias"}</strong></p>
          <p><Target size={16} /> Meta do mês <strong>{monthlyGoal ? `${monthWorkouts.length}/${monthlyGoal} treinos` : "Meta mensal não definida"}</strong></p>
        </div>
      </article>

      <article className="calendar-month-card">
        <div className="calendar-card-title">
          <h3>{formatMonthYear(monthDate)}</h3>
          <div>
            <button type="button" aria-label="Màs anterior" onClick={() => changeMonth(-1)}><ChevronLeft size={18} /></button>
            <button type="button" onClick={goToday}>Hoje</button>
            <button type="button" aria-label="Próximo mês" onClick={() => changeMonth(1)}><ChevronRight size={18} /></button>
          </div>
        </div>
        <div className="calendar-week-labels">
          {weekLabels.map((label) => <span key={label}>{label}</span>)}
        </div>
        <div className="calendar-contribution-grid">
          {monthDays.map((day) => {
            const dayEvents = eventsByDay.get(day.dateKey) || [];
            const type = dayEvents[0]?.type || "none";
            const isToday = day.dateKey === todayKey && day.inMonth;
            const selected = day.dateKey === selectedKey;
            return (
              <button
                key={day.dateKey}
                className={`calendar-day ${type} ${day.inMonth ? "" : "muted"} ${isToday ? "today" : ""} ${selected ? "selected" : ""}`}
                type="button"
                onClick={() => openDay(day)}
              >
                <span>{day.day}</span>
                <i />
              </button>
            );
          })}
        </div>
        <div className="calendar-legend compact-legend">
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
          <img className="calendar-personal-photo" src="/personal-thiago.jpeg" alt="Personal Thiago Filippo" onError={(event) => { event.currentTarget.src = "/erika-gomes.jpeg"; }} />
          <div>
            <span>Personal</span>
            <strong>Thiago Filippo</strong>
            <p><CalendarDays size={15} /> Sem consulta confirmada</p>
            <p><Clock size={15} /> Agende um horário</p>
            <p><Wifi size={15} /> Online ou presencial</p>
          </div>
          <img className="calendar-return-lion" src="/lion-juda-logo.png" alt="" />
        </div>
        <button className="calendar-metal-button" type="button" onClick={() => setScheduleOpen(true)}>
          Agendar consulta
        </button>
        <div className="calendar-return-actions">
          <button type="button" onClick={() => setAttendance(true)}>{attendance ? <Check size={17} /> : <CalendarDays size={17} />} {attendance ? "Presença confirmada" : "Confirmar presença"}</button>
          <button type="button" onClick={() => setScheduleOpen(true)}><Pencil size={17} /> Solicitar remarcação</button>
        </div>
      </article>

      <div className="student-calendar-grid">
        <article className="calendar-mini-card adherence">
          <h3>Aderência geral</h3>
          <div className="calendar-progress-ring"><strong>{monthWorkouts.length ? Math.min(100, Math.round((monthWorkouts.length / Math.max(monthlyGoal || monthWorkouts.length, 1)) * 100)) : 0}%</strong></div>
          <p>{monthWorkouts.length ? "Seu calendário já está registrando atividades reais." : "Seu progresso começará a aparecer após o primeiro treino."}</p>
        </article>

        <article className="calendar-mini-card goals">
          <h3>Metas do mês</h3>
          {monthlyGoal ? (
            <GoalLine label="Treinos" value={`${monthWorkouts.length}/${monthlyGoal}`} progress={`${Math.min(100, Math.round((monthWorkouts.length / monthlyGoal) * 100))}%`} className="workout" />
          ) : (
            <p className="calendar-empty-message">Meta mensal não definida.</p>
          )}
        </article>

        <article className="calendar-mini-card events">
          <h3>Atividades reais</h3>
          {events.length ? events.slice(0, 4).map((event) => (
            <button key={event.id} type="button" onClick={() => openDay({ dateKey: event.dateKey, date: new Date(`${event.dateKey}T00:00:00`), day: Number(event.dateKey.slice(-2)), inMonth: true })}>
              <i className={event.type} />
              <span><strong>{event.title}</strong><small>{formatDateBR(`${event.dateKey}T00:00:00`)} - {event.detail}</small></span>
              <ChevronRight size={17} />
            </button>
          )) : <p className="calendar-empty-message">Nenhuma atividade registrada ainda.</p>}
        </article>

        <article className="calendar-mini-card message">
          <h3>Mensagem do seu Personal</h3>
          <div>
            <img src="/lion-juda-logo.png" alt="" />
            <span><strong>Thiago Filippo</strong><small>Quando você concluir treinos, dieta ou avaliações, tudo aparecerá aqui com dados reais.</small></span>
          </div>
          <p>Pronto para iniciar novos registros em 24/07/2026.</p>
          <button type="button"><MessageCircle size={17} /> Enviar mensagem</button>
        </article>
      </div>

      {dayDetail && (
        <CalendarModal title={formatDateBR(`${dayDetail.dateKey}T00:00:00`)} onClose={() => setDayDetail(null)}>
          <div className="calendar-day-detail">
            {dayDetail.events.length ? dayDetail.events.map((event) => (
              <p key={event.id}><EventIcon type={event.type} /> <strong>{eventLabels[event.type] || event.title}:</strong> {event.title} - {event.detail}</p>
            )) : <p>Nenhuma atividade registrada nesta data.</p>}
          </div>
        </CalendarModal>
      )}

      {scheduleOpen && (
        <CalendarModal title="Agendar consulta" subtitle="Escolha o melhor dia e horário para seu retorno." onClose={() => setScheduleOpen(false)}>
          <div className="schedule-personal-card">
            <img src="/personal-thiago.jpeg" alt="" onError={(event) => { event.currentTarget.src = "/lion-juda-logo.png"; }} />
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

          <h4>2. Horários disponíveis - {availableDays[selectedDay][1]} de Julho</h4>
          <div className="schedule-time-list">
            {availableTimes.map((time) => (
              <button key={time} className={selectedTime === time ? "active" : ""} type="button" onClick={() => setSelectedTime(time)}>
                <Clock size={18} />
                {time}
                {selectedTime === time && <Check size={18} />}
              </button>
            ))}
          </div>

          <div className="schedule-summary">
            <h4>3. Resumo da consulta</h4>
            <p><span>Data</span><strong>{selectedDate}</strong></p>
            <p><span>Horário</span><strong>{selectedTime}</strong></p>
            <p><span>Profissional</span><strong>Personal Thiago Filippo</strong></p>
            <p><span>Tipo de atendimento</span><strong>{serviceType}</strong></p>
          </div>

          <button className="calendar-metal-button" type="button" onClick={confirmSchedule}>Confirmar agendamento</button>
          <button className="calendar-ghost-button" type="button" onClick={() => setScheduleOpen(false)}>Cancelar</button>
          <p className="schedule-note">Ao confirmar, seu horário será salvo no calendário e aparecerá como compromisso real.</p>
        </CalendarModal>
      )}
    </section>
  );
}

function EventIcon({ type }) {
  if (type === "workout") return <Dumbbell size={17} />;
  if (type === "consultation") return <Clock size={17} />;
  return <CalendarDays size={17} />;
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
