import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Droplets,
  Dumbbell,
  FileText,
  Flame,
  HeartPulse,
  Image,
  LineChart,
  Play,
  Scale,
  Sparkles,
  Utensils
} from "lucide-react";
import {
  calculateCurrentWorkoutStreak,
  completedWorkoutsInMonth,
  loadWorkoutHistory,
  toLocalDateKey
} from "../utils/activityData.js";

const week = ["S", "T", "Q", "Q", "S", "S", "D"];
const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
const ACTIVE_WORKOUT_KEY = "ptf_active_workout_id";
const weekDays = ["Domingo", "Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado"];

function normalizeText(value = "") {
  return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}


function resolveWorkout(workouts = [], activeWorkoutId) {
  if (!workouts.length) return null;
  const selected = workouts.find((item) => item.id === activeWorkoutId);
  if (selected) return selected;
  const today = normalizeText(weekDays[new Date().getDay()]);
  return workouts.find((item) => normalizeText(item.date).includes(today)) || workouts[0];
}

function sumVolume(history) {
  return history.reduce((sum, item) => sum + (Number(item.volume) || 0), 0);
}

function currentWeekDoneSet(history) {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const dates = new Set(history.map((item) => item.dateKey));
  return new Set(week.map((_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return dates.has(toLocalDateKey(date)) ?index : null;
  }).filter((value) => value !== null));
}

export default function StudentDashboard({ students, workouts, onNavigate, onStartWorkout }) {
  const student = students[0];
  const [activeWorkoutId, setActiveWorkoutId] = useState(() => {
    try { return window.localStorage.getItem(ACTIVE_WORKOUT_KEY); } catch { return null; }
  });
  const todayWorkout = resolveWorkout(workouts, activeWorkoutId);
  const [history, setHistory] = useState(() => loadWorkoutHistory());

  useEffect(() => {
    const refresh = () => setHistory(loadWorkoutHistory());
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    const refreshActiveWorkout = (event) => {
      const nextId = event?.detail?.workoutId;
      if (nextId) {
        setActiveWorkoutId(nextId);
        return;
      }
      try { setActiveWorkoutId(window.localStorage.getItem(ACTIVE_WORKOUT_KEY)); } catch {}
    };
    window.addEventListener("ptf-active-workout-changed", refreshActiveWorkout);
    window.addEventListener("storage", refreshActiveWorkout);
    return () => {
      window.removeEventListener("ptf-active-workout-changed", refreshActiveWorkout);
      window.removeEventListener("storage", refreshActiveWorkout);
    };
  }, []);

  const completedWorkouts = history;
  const streak = calculateCurrentWorkoutStreak(history);
  const totalVolume = sumVolume(history);
  const monthWorkouts = completedWorkoutsInMonth(history);
  const score = completedWorkouts.length ?Math.min(100, 60 + completedWorkouts.length * 4 + Math.min(streak * 3, 24)) : 0;
  const weeklyDone = useMemo(() => currentWeekDoneSet(completedWorkouts), [completedWorkouts.length]);
  const emptyMessage = "Seu progresso começará a aparecer após o primeiro treino.";

  return (
    <div className="student-premium-dashboard">
      <section className="student-score-hero">
        <div>
          <p className="eyebrow">Score do Leão</p>
          <div className="student-score-number">
            <strong>{score}</strong>
            <span>/100</span>
          </div>
          <b>{score >= 90 ?"Excelente" : score > 0 ?"Em evolução" : "Sem dados ainda"}</b>
          <div className="xp-bar"><span style={{ width: `${score}%` }} /></div>
          <small>{completedWorkouts.length ?"Baseado em treinos concluídos, sequência e volume registrado." : emptyMessage}</small>
        </div>
        <img src="/lion-juda-logo.png" alt="Leão de Judá" />
      </section>

      <section className="student-streak-card">
        <p className="eyebrow">Sequência</p>
        <div><strong>{streak}</strong><span>{streak === 1 ?"dia seguido" : "dias seguidos"}</span></div>
        <div className="student-week-row">
          {week.map((day, index) => (
            <span key={day + index} className={weeklyDone.has(index) ?"done" : ""}>
              <CheckCircle2 size={18} />
              <small>{day}</small>
            </span>
          ))}
        </div>
      </section>

      <section className="student-mini-evolution">
        <p className="eyebrow">Evolução semanal</p>
        {completedWorkouts.length ?(
          <svg viewBox="0 0 120 54" preserveAspectRatio="none" aria-label="Evolução semanal">
            <polyline points="4,46 22,36 40,40 58,28 78,34 98,18 116,26" />
            <circle cx="98" cy="18" r="3" />
          </svg>
        ) : <p className="dashboard-empty-note">Nenhuma atividade registrada ainda.</p>}
        <strong>{totalVolume ?`${Math.round(totalVolume).toLocaleString("pt-BR")} kg` : "0 kg"}</strong>
        <span>{totalVolume ?"Volume registrado" : "Volume real"}</span>
      </section>

      <section className="student-workout-hero">
        <div>
          <p className="eyebrow">Treino do dia</p>
          <h2>{todayWorkout?.name || "Treino de hoje"}</h2>
          <ul>
            <li><ClipboardCheck size={17} />{todayWorkout?.exercises?.length || 0} exercícios</li>
            <li><BarChart3 size={17} />{todayWorkout?.duration || "60 min"}</li>
            <li><Flame size={17} />estimativa do treino</li>
          </ul>
          <button type="button" onClick={() => todayWorkout ?onStartWorkout?.(todayWorkout.id) : onNavigate("student-view")}>Acessar treino <Play size={16} /></button>
        </div>
        <div className="student-workout-avatar premium-photo">
          <img src={student?.avatar || "/erika-gomes.jpeg"} alt={student?.name || "Aluno"} />
        </div>
      </section>

      <section className="student-progress-card">
        <p className="eyebrow">Progresso geral</p>
        <div className="progress-ring neon-ring" style={{ "--value": `${score}%` }}>
          <strong>{score}%</strong>
        </div>
        <b>{score ?"Continue firme" : "Primeiro treino aguardando"}</b>
        <span>{completedWorkouts.length} treino(s) finalizado(s)</span>
      </section>

      <section className="student-metrics-grid">
        {[
          ["Peso atual", "--", "kg", "Sem avaliação registrada", Scale],
          ["Gordura corporal", "--", "%", "Sem avaliação registrada", HeartPulse],
          ["IMC", "--", "", "Sem avaliação registrada", LineChart],
          ["Água", "0", "L", "Nenhum registro hoje", Droplets],
          ["Calorias", "0", "", "Nenhum registro hoje", Flame],
          ["Treinos concluídos", String(monthWorkouts.length), "", "Este mês", Dumbbell]
        ].map(([label, value, unit, detail, Icon]) => (
          <article key={label} className="student-metric-card">
            <Icon size={20} />
            <span>{label}</span>
            <strong>{value}<small>{unit}</small></strong>
            <em>{detail}</em>
          </article>
        ))}
      </section>

      <section className="student-physical-chart">
        <div className="section-heading"><div><p className="eyebrow">Evolução física</p><h2>Dados reais</h2></div></div>
        {completedWorkouts.length ?(
          <div className="student-chart-lines"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="0,76 16,70 32,66 48,58 64,46 80,38 100,32" /></svg><div>{months.map((month) => <span key={month}>{month}</span>)}</div></div>
        ) : <p className="empty-history-text">Nenhuma atividade registrada ainda. {emptyMessage}</p>}
      </section>

      <section className="student-diet-card"><p className="eyebrow">Dieta de hoje</p><div><Utensils size={26} /><strong>0 <small>kcal</small></strong></div><span>Nenhuma refeição registrada hoje</span><div className="xp-bar"><span style={{ width: "0%" }} /></div><button type="button" onClick={() => onNavigate?.("diet")}>Ver plano alimentar</button></section>

      <section className="student-coach-panel"><div><p className="eyebrow">Coach IA <span>Novo</span></p><h2>Seu assistente inteligente para te ajudar a evoluir todos os dias.</h2><div>{["Tirar dúvidas", "Sugestáo de treino", "Analisar evolução", "Sugerir refeição", "Motivação"].map((action) => <button key={action} type="button" onClick={() => onNavigate?.("coach")}><Sparkles size={16} />{action}</button>)}</div></div><img src="/lion-juda-logo.png" alt="" /></section>

      <section className="student-quick-access"><p className="eyebrow">Acessos rápidos</p><div>{[["Exercícios", Dumbbell], ["Medidas", ClipboardCheck], ["Fotos", Image], ["Relatórios", FileText], ["Avaliações", CalendarDays], ["Calendário", Camera]].map(([label, Icon]) => <button key={label} type="button"><Icon size={20} />{label}</button>)}</div></section>

      <section className="student-next-assessment"><p className="eyebrow">Próxima avaliação</p><strong>Não agendada</strong><span>Nenhuma avaliação registrada ainda</span><button type="button" onClick={() => onNavigate?.("assessments")}>Ver avaliações</button></section>
    </div>
  );
}
