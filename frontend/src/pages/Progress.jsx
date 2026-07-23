import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BadgeCheck,
  Camera,
  Droplets,
  Dumbbell,
  Flame,
  HeartPulse,
  LineChart,
  Medal,
  Scale,
  Sparkles,
  Trophy,
  TrendingUp,
  Utensils
} from "lucide-react";
import {
  calculateCurrentWorkoutStreak,
  completedWorkoutsInMonth,
  loadWorkoutHistory
} from "../utils/activityData.js";

function sumVolume(history) {
  return history.reduce((sum, item) => sum + (Number(item.volume) || 0), 0);
}

function buildExerciseLoads(history) {
  const map = new Map();
  history.forEach((record) => {
    (record.exercises || []).forEach((exercise) => {
      const value = Number(String(exercise.maxLoad || "").replace(",", ".").replace(/[^0-9.]/g, ""));
      if (!Number.isFinite(value) || value <= 0) return;
      const current = map.get(exercise.name) || { name: exercise.name, start: value, current: value };
      map.set(exercise.name, { ...current, current: Math.max(current.current, value) });
    });
  });
  return [...map.values()].slice(0, 4).map((item) => ({ ...item, percent: Math.min(100, Math.round((item.current / Math.max(item.start, 1)) * 70)) }));
}

export default function Progress({ student, students = [] }) {
  const [modal, setModal] = useState(null);
  const [history, setHistory] = useState(() => loadWorkoutHistory());
  const currentStudent = student || students[0] || {};
  const avatar = currentStudent.avatar || "/erika-gomes.jpeg";
  const hasHistory = history.length > 0;
  const streak = calculateCurrentWorkoutStreak(history);
  const monthWorkouts = completedWorkoutsInMonth(history);
  const totalVolume = sumVolume(history);
  const loadProgress = useMemo(() => buildExerciseLoads(history), [history]);
  const score = hasHistory ? Math.min(100, 60 + history.length * 4 + Math.min(streak * 3, 24)) : 0;

  useEffect(() => {
    const refresh = () => setHistory(loadWorkoutHistory());
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const metricCards = [
    { label: "Peso atual", value: "--", diff: "Sem avaliação", note: "aguardando registro", icon: Scale },
    { label: "Gordura corporal", value: "--", diff: "Sem avaliação", note: "aguardando registro", icon: HeartPulse },
    { label: "Massa magra", value: "--", diff: "Sem avaliação", note: "aguardando registro", icon: Activity },
    { label: "IMC", value: "--", diff: "Sem avaliação", note: "aguardando registro", icon: BadgeCheck },
    { label: "Água corporal", value: "--", diff: "Sem avaliação", note: "aguardando registro", icon: Droplets },
    { label: "Treinos concluídos", value: String(history.length), diff: `${monthWorkouts.length} este mês`, note: "dados reais", icon: TrendingUp },
    { label: "Score do Leão", value: `${score}/100`, diff: hasHistory ? "Em evolução" : "Sem dados", note: "baseado em treinos concluídos", icon: Trophy }
  ];

  return (
    <section className="student-progress-premium">
      <header className="student-progress-hero">
        <div>
          <p className="eyebrow">Central de evolu??o</p>
          <h1>{hasHistory ? "Voc? est? evoluindo de verdade." : "Seu progresso come?a no primeiro treino."}</h1>
          <span>{hasHistory ? "For?a, medidas, dieta e consist?ncia reunidas em uma tela premium." : "Nenhuma atividade registrada ainda. Seu progresso come?ar? a aparecer ap?s o primeiro treino."}</span>
          <div className="student-progress-hero-actions">
            <button type="button" onClick={() => setModal("analysis")}>Ver an?lise completa</button>
            <button type="button" onClick={() => setModal("coach")}>Falar com Coach IA</button>
          </div>
        </div>
        <img className="student-progress-lion" src="/lion-juda-logo.png" alt="Leão de Judá" />
        <div className="student-progress-profile">
          <img src={avatar} alt={currentStudent.name || "Aluno"} />
          <strong>{currentStudent.name || "Erika Gomes"}</strong>
          <small>Score do Leão {score}/100</small>
        </div>
      </header>

      <section className="student-progress-kpis">
        {metricCards.map(({ label, value, diff, note, icon: Icon }) => (
          <article key={label} className="student-progress-kpi">
            <span><Icon size={18} /></span>
            <small>{label}</small>
            <strong>{value}</strong>
            <em>{diff}</em>
            <p>{note}</p>
          </article>
        ))}
      </section>

      <section className="student-progress-grid student-progress-grid-top">
        <article className="student-progress-card load-evolution-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Evolução de carga</p>
              <h2>{hasHistory ? "For?a registrada" : "Aguardando treino"}</h2>
            </div>
            <Dumbbell size={22} />
          </div>
          {loadProgress.length ? (
            <div className="load-list">
              {loadProgress.map((item) => (
                <div key={item.name} className="load-row">
                  <div><strong>{item.name}</strong><span>{item.start}kg ? {item.current}kg</span></div>
                  <em>+{Math.max(0, item.current - item.start)}kg</em>
                  <div className="silver-bar"><span style={{ width: `${item.percent}%` }} /></div>
                </div>
              ))}
            </div>
          ) : <p className="empty-history-text">Nenhuma atividade registrada ainda.</p>}
        </article>

        <article className="student-progress-card records-card">
          <div className="section-heading"><div><p className="eyebrow">Seus recordes</p><h2>Marcas reais</h2></div><Medal size={22} /></div>
          <div className="record-grid">
            <div><span>Maior carga</span><strong>{loadProgress[0]?.current ? `${loadProgress[0].current} kg` : "--"}</strong><small>ap?s registrar carga</small></div>
            <div><span>Maior sequ?ncia</span><strong>{streak}</strong><small>dias seguidos</small></div>
            <div><span>Treinos concluídos</span><strong>{history.length}</strong><small>histórico real</small></div>
            <div><span>Volume total</span><strong>{Math.round(totalVolume).toLocaleString("pt-BR")} kg</strong><small>treinos finalizados</small></div>
          </div>
        </article>

        <article className="student-progress-card consistency-card">
          <p className="eyebrow">Streak e consist?ncia</p>
          <strong>{streak} <span>{streak === 1 ? "dia seguido" : "dias seguidos"}</span></strong>
          <ul>
            <li><Flame size={17} /> Frequ?ncia semanal: dados ap?s treinos</li>
            <li><BadgeCheck size={17} /> Treinos concluídos: {history.length}</li>
            <li><LineChart size={17} /> Consist?ncia mensal: {monthWorkouts.length ? "em constru??o" : "sem dados"}</li>
          </ul>
        </article>
      </section>

      <section className="student-progress-grid student-progress-grid-middle">
        <article className="student-progress-card body-evolution-card">
          <div className="section-heading"><div><p className="eyebrow">Evolução corporal</p><h2>Dados reais</h2></div><span>Avaliações e treinos</span></div>
          {hasHistory ? <div className="strength-chart"><svg viewBox="0 0 520 210"><polyline points="20,175 110,154 200,118 290,96 380,62 500,34" fill="none" stroke="#f5f5f5" strokeWidth="4" strokeLinecap="round" /></svg></div> : <p className="empty-history-text">Seu progresso come?ar? a aparecer ap?s o primeiro treino.</p>}
        </article>

        <article className="student-progress-card visual-progress-student">
          <div className="section-heading"><div><p className="eyebrow">Evolução visual</p><h2>Fotos comparativas</h2></div><Camera size={21} /></div>
          <p className="empty-history-text">Nenhuma avaliação com foto registrada ainda.</p>
          <button type="button" onClick={() => setModal("evolution")}>Comparar antes/depois</button>
        </article>

        <article className="student-progress-card measures-card-student">
          <div className="section-heading"><div><p className="eyebrow">Medidas corporais</p><h2>Aguardando avaliação</h2></div><span>Atual x anterior</span></div>
          {["Cintura", "Bra?o", "Peito", "Quadril", "Coxa"].map((label) => <div key={label} className="measure-row-student"><span>{label}</span><strong>--</strong><em>sem registro</em></div>)}
        </article>
      </section>

      <section className="student-progress-grid student-progress-grid-bottom">
        <article className="student-progress-card diet-progress-card-student">
          <div className="section-heading"><div><p className="eyebrow">Progresso da dieta</p><h2>Alimenta??o e hidrata??o</h2></div><Utensils size={22} /></div>
          <div className="diet-progress-metrics">
            <div><strong>0%</strong><span>Ader?ncia alimentar</span></div>
            <div><strong>0g</strong><span>Prote?nas m?dias</span></div>
            <div><strong>0L</strong><span>Hidrata??o m?dia</span></div>
            <div><strong>0</strong><span>Calorias m?dias</span></div>
          </div>
          <div className="silver-bar"><span style={{ width: "0%" }} /></div>
        </article>

        <article className="student-progress-card ai-insights-student">
          <div className="section-heading"><div><p className="eyebrow">Insights da IA</p><h2>Coach IA</h2></div><Sparkles size={22} /></div>
          <ul>
            <li>{hasHistory ? `Voc? j? concluiu ${history.length} treino(s).` : "Finalize seu primeiro treino para liberar insights reais."}</li>
            <li>{streak ? `Sua sequ?ncia atual ? de ${streak} dia(s).` : "Sua sequ?ncia ser? calculada apenas com treinos finalizados."}</li>
            <li>O Coach IA n?o altera seus treinos; ele apenas explica e orienta.</li>
          </ul>
          <button type="button" onClick={() => setModal("coach")}>Perguntar ao Coach IA</button>
        </article>
      </section>
      {modal && (
        <div className="progress-modal-backdrop" role="presentation" onMouseDown={() => setModal(null)}>
          <article className="progress-action-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setModal(null)}>Fechar</button>
            <p className="eyebrow">{modal === "coach" ? "Coach IA" : modal === "evolution" ? "Evolução visual" : "Análise completa"}</p>
            <h2>{modal === "coach" ? "Como posso te ajudar hoje?" : modal === "evolution" ? "Comparativo antes/depois" : "Resumo da sua evolu??o"}</h2>
            <p>{hasHistory ? "Esta an?lise usa seus treinos finalizados e registros reais." : "Nenhuma atividade registrada ainda. Seu progresso come?ar? a aparecer ap?s o primeiro treino."}</p>
          </article>
        </div>
      )}
    </section>
  );
}
