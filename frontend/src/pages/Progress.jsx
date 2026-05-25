import React from "react";
import { CalendarCheck, Medal, TrendingUp } from "lucide-react";
import ProgressChart from "../components/ProgressChart.jsx";
import { progressLogs } from "../data/mockData.js";
import StatCard from "../components/StatCard.jsx";

export default function Progress({ students, workouts, completed }) {
  const totalExercises = workouts.reduce((sum, workout) => sum + workout.exercises.length, 0);

  return (
    <div className="page-grid">
      <section className="stats-grid">
        <StatCard icon={CalendarCheck} label="Exercícios concluídos" value={completed.size} detail={`${totalExercises} prescritos no ciclo`} />
        <StatCard icon={TrendingUp} label="Evolução média" value="+18%" detail="Força nos principais exercícios" />
        <StatCard icon={Medal} label="Melhor aderência" value={students[0]?.name || "-"} detail="Consistência acima de 90%" />
      </section>
      <section className="dashboard-layout">
        <ProgressChart data={progressLogs} />
        <article className="history-panel">
          <p className="eyebrow">Histórico</p>
          <h2>Linha do tempo</h2>
          {[
            ["Hoje", "Supino reto concluído com 82 kg e execução aprovada."],
            ["Ontem", "Check-in corporal registrado com queda de 1.2% de gordura."],
            ["14 Mai", "Novo PR técnico no agachamento livre."],
            ["10 Mai", "Treino ajustado para reduzir impacto lombar."]
          ].map(([date, text]) => (
            <div className="timeline-item" key={date}>
              <span>{date}</span>
              <p>{text}</p>
            </div>
          ))}
        </article>
      </section>
    </div>
  );
}
