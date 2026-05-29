import React from "react";
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

const week = ["S", "T", "Q", "Q", "S", "S", "D"];
const months = ["Dez", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];

export default function StudentDashboard({ students, workouts, onNavigate }) {
  const student = students[0];
  const todayWorkout = workouts[0];

  return (
    <div className="student-premium-dashboard">
      <section className="student-score-hero">
        <div>
          <p className="eyebrow">Score do Leão</p>
          <div className="student-score-number">
            <strong>92</strong>
            <span>/100</span>
          </div>
          <b>Excelente</b>
          <div className="xp-bar"><span style={{ width: "92%" }} /></div>
          <small>Você está no caminho dos seus melhores resultados.</small>
        </div>
        <img src="/lion-juda-logo.png" alt="Leão de Judá" />
      </section>

      <section className="student-streak-card">
        <p className="eyebrow">Sequência 🔥</p>
        <div><strong>12</strong><span>dias seguidos</span></div>
        <div className="student-week-row">
          {week.map((day, index) => (
            <span key={`${day}-${index}`} className={index < 6 ? "done" : ""}>
              <CheckCircle2 size={18} />
              <small>{day}</small>
            </span>
          ))}
        </div>
      </section>

      <section className="student-mini-evolution">
        <p className="eyebrow">Evolução semanal</p>
        <svg viewBox="0 0 120 54" preserveAspectRatio="none" aria-label="Evolução semanal">
          <polyline points="4,46 22,18 40,28 58,14 78,32 98,10 116,26" />
          <circle cx="98" cy="10" r="3" />
        </svg>
        <strong>+1.2 kg</strong>
        <span>Massa magra</span>
      </section>

      <section className="student-workout-hero">
        <div>
          <p className="eyebrow">Treino do dia</p>
          <h2>{todayWorkout?.name || "Inferiores - Força"}</h2>
          <ul>
            <li><ClipboardCheck size={17} />{todayWorkout?.exercises?.length || 6} exercícios</li>
            <li><BarChart3 size={17} />{todayWorkout?.duration || "60 min"}</li>
            <li><Flame size={17} />420 kcal</li>
          </ul>
          <button type="button" onClick={() => onNavigate("student-view")}>Iniciar treino <Play size={16} /></button>
        </div>
        <img src={student?.avatar} alt={student?.name || "Aluno"} />
      </section>

      <section className="student-progress-card">
        <p className="eyebrow">Progresso geral</p>
        <div className="progress-ring neon-ring" style={{ "--value": "87%" }}>
          <strong>87%</strong>
        </div>
        <b>Excelente!</b>
        <span>↑ 12% vs mês anterior</span>
      </section>

      <section className="student-metrics-grid">
        {[
          ["Peso atual", "67,4", "kg", "↓ 0,8 kg", Scale],
          ["Gordura corporal", "18,6", "%", "↓ 1,2%", HeartPulse],
          ["IMC", "22,4", "", "Normal", LineChart],
          ["Água", "1,8", "L", "72% da meta", Droplets],
          ["Calorias", "1.650", "", "Meta: 2.200 kcal", Flame],
          ["Massa magra", "+1,2", "kg", "Este mês", Dumbbell]
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
        <div className="section-heading">
          <div>
            <p className="eyebrow">Evolução física</p>
            <h2>Últimos 6 meses</h2>
          </div>
        </div>
        <div className="student-chart-lines">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline points="0,14 16,24 32,36 48,48 64,62 80,74 100,56" />
            <polyline points="0,42 16,50 32,58 48,68 64,58 80,46 100,44" />
            <polyline points="0,76 16,80 32,83 48,72 64,70 80,78 100,74" />
          </svg>
          <div>{months.map((month) => <span key={month}>{month}</span>)}</div>
        </div>
      </section>

      <section className="student-diet-card">
        <p className="eyebrow">Dieta de hoje</p>
        <div>
          <Utensils size={26} />
          <strong>2.120 <small>kcal</small></strong>
        </div>
        <span>Meta: 2.200 kcal</span>
        <div className="xp-bar"><span style={{ width: "82%" }} /></div>
        <button type="button" onClick={() => onNavigate?.("diet")}>Ver plano alimentar</button>
      </section>

      <section className="student-coach-panel">
        <div>
          <p className="eyebrow">Coach IA <span>Novo</span></p>
          <h2>Seu assistente inteligente para te ajudar a evoluir todos os dias.</h2>
          <div>
            {["Tirar dúvidas", "Sugestão treino", "Analisar evolução", "Sugerir refeição", "Motivação"].map((action) => (
              <button key={action} type="button"><Sparkles size={16} />{action}</button>
            ))}
          </div>
        </div>
        <img src="/lion-juda-logo.png" alt="" />
      </section>

      <section className="student-quick-access">
        <p className="eyebrow">Acessos rápidos</p>
        <div>
          {[
            ["Exercícios", Dumbbell],
            ["Medidas", ClipboardCheck],
            ["Fotos", Image],
            ["Relatórios", FileText],
            ["Avaliações", CalendarDays],
            ["Calendário", Camera]
          ].map(([label, Icon]) => (
            <button key={label} type="button"><Icon size={20} />{label}</button>
          ))}
        </div>
      </section>

      <section className="student-next-assessment">
        <p className="eyebrow">Próxima avaliação</p>
        <strong>21/06/2025</strong>
        <span>Faltam 15 dias</span>
        <button type="button">Ver avaliações</button>
      </section>
    </div>
  );
}
