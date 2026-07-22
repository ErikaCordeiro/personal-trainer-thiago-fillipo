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

const HISTORY_KEY = "ptf_workout_history_v2";
const week = ["S", "T", "Q", "Q", "S", "S", "D"];
const months = ["Dez", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];

function loadHistory() {
  try {
    return JSON.parse(window.localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function toDayKey(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function calculateStreak(history) {
  const doneDays = new Set(history.filter((item) => item.status === "concluido").map((item) => toDayKey(item.date)).filter(Boolean));
  if (!doneDays.size) return 0;
  const sorted = [...doneDays].sort();
  const cursor = new Date(sorted.at(-1));
  let streak = 0;
  while (doneDays.has(toDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function sumVolume(history) {
  return history.reduce((sum, item) => sum + (Number(item.volume) || 0), 0);
}

export default function StudentDashboard({ students, workouts, onNavigate }) {
  const student = students[0];
  const todayWorkout = workouts[0];
  const [history, setHistory] = useState(() => loadHistory());

  useEffect(() => {
    const refresh = () => setHistory(loadHistory());
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const completedWorkouts = history.filter((item) => item.status === "concluido");
  const streak = calculateStreak(history);
  const totalVolume = sumVolume(history);
  const score = Math.min(100, Math.max(72, 78 + completedWorkouts.length * 2 + Math.min(streak, 12)));
  const weeklyDone = useMemo(() => new Set(completedWorkouts.slice(0, 7).map((_, index) => index)), [completedWorkouts.length]);

  return (
    <div className="student-premium-dashboard">
      <section className="student-score-hero">
        <div>
          <p className="eyebrow">Score do Le?o</p>
          <div className="student-score-number">
            <strong>{score}</strong>
            <span>/100</span>
          </div>
          <b>{score >= 90 ? "Excelente" : "Em evolu??o"}</b>
          <div className="xp-bar"><span style={{ width: score + "%" }} /></div>
          <small>{completedWorkouts.length ? "Baseado em treinos conclu?dos, sequ?ncia, ader?ncia, hidrata??o e evolu??o." : "Finalize seu primeiro treino para come?ar seu hist?rico real."}</small>
        </div>
        <img src="/lion-juda-logo.png" alt="Le?o de Jud?" />
      </section>

      <section className="student-streak-card">
        <p className="eyebrow">Sequ?ncia</p>
        <div><strong>{streak}</strong><span>{streak === 1 ? "dia seguido" : "dias seguidos"}</span></div>
        <div className="student-week-row">
          {week.map((day, index) => (
            <span key={day + index} className={weeklyDone.has(index) ? "done" : ""}>
              <CheckCircle2 size={18} />
              <small>{day}</small>
            </span>
          ))}
        </div>
      </section>

      <section className="student-mini-evolution">
        <p className="eyebrow">Evolu??o semanal</p>
        <svg viewBox="0 0 120 54" preserveAspectRatio="none" aria-label="Evolu??o semanal">
          <polyline points="4,46 22,18 40,28 58,14 78,32 98,10 116,26" />
          <circle cx="98" cy="10" r="3" />
        </svg>
        <strong>{totalVolume ? Math.round(totalVolume).toLocaleString("pt-BR") + " kg" : "+1,2 kg"}</strong>
        <span>{totalVolume ? "Volume registrado" : "Massa magra"}</span>
      </section>

      <section className="student-workout-hero">
        <div>
          <p className="eyebrow">Treino do dia</p>
          <h2>{todayWorkout?.name || "Treino de hoje"}</h2>
          <ul>
            <li><ClipboardCheck size={17} />{todayWorkout?.exercises?.length || 0} exerc?cios</li>
            <li><BarChart3 size={17} />{todayWorkout?.duration || "60 min"}</li>
            <li><Flame size={17} />420 kcal</li>
          </ul>
          <button type="button" onClick={() => onNavigate("student-view")}>Acessar treino <Play size={16} /></button>
        </div>
        <div className="student-workout-emblem" aria-hidden="true">
          <img src="/lion-juda-logo.png" alt="" />
        </div>
      </section>

      <section className="student-progress-card">
        <p className="eyebrow">Progresso geral</p>
        <div className="progress-ring neon-ring" style={{ "--value": score + "%" }}>
          <strong>{score}%</strong>
        </div>
        <b>{score >= 90 ? "Excelente!" : "Continue firme"}</b>
        <span>{completedWorkouts.length} treino(s) finalizados</span>
      </section>

      <section className="student-metrics-grid">
        {[
          ["Peso atual", "67,4", "kg", "? 0,8 kg", Scale],
          ["Gordura corporal", "18,6", "%", "? 1,2%", HeartPulse],
          ["IMC", "22,4", "", "Normal", LineChart],
          ["?gua", "1,8", "L", "72% da meta", Droplets],
          ["Calorias", "1.650", "", "Meta: 2.200 kcal", Flame],
          ["Massa magra", "+1,2", "kg", "Este m?s", Dumbbell]
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
        <div className="section-heading"><div><p className="eyebrow">Evolu??o f?sica</p><h2>?ltimos 6 meses</h2></div></div>
        <div className="student-chart-lines"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="0,14 16,24 32,36 48,48 64,62 80,74 100,56" /><polyline points="0,42 16,50 32,58 48,68 64,58 80,46 100,44" /><polyline points="0,76 16,80 32,83 48,72 64,70 80,78 100,74" /></svg><div>{months.map((month) => <span key={month}>{month}</span>)}</div></div>
      </section>

      <section className="student-diet-card"><p className="eyebrow">Dieta de hoje</p><div><Utensils size={26} /><strong>2.120 <small>kcal</small></strong></div><span>Meta: 2.200 kcal</span><div className="xp-bar"><span style={{ width: "82%" }} /></div><button type="button" onClick={() => onNavigate?.("diet")}>Ver plano alimentar</button></section>

      <section className="student-coach-panel"><div><p className="eyebrow">Coach IA <span>Novo</span></p><h2>Seu assistente inteligente para te ajudar a evoluir todos os dias.</h2><div>{["Tirar d?vidas", "Sugest?o de treino", "Analisar evolu??o", "Sugerir refei??o", "Motiva??o"].map((action) => <button key={action} type="button" onClick={() => onNavigate?.("coach")}><Sparkles size={16} />{action}</button>)}</div></div><img src="/lion-juda-logo.png" alt="" /></section>

      <section className="student-quick-access"><p className="eyebrow">Acessos r?pidos</p><div>{[["Exerc?cios", Dumbbell], ["Medidas", ClipboardCheck], ["Fotos", Image], ["Relat?rios", FileText], ["Avalia??es", CalendarDays], ["Calend?rio", Camera]].map(([label, Icon]) => <button key={label} type="button"><Icon size={20} />{label}</button>)}</div></section>

      <section className="student-next-assessment"><p className="eyebrow">Pr?xima avalia??o</p><strong>21/06/2025</strong><span>Faltam 15 dias</span><button type="button" onClick={() => onNavigate?.("assessments")}>Ver avalia??es</button></section>
    </div>
  );
}
