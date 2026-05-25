import React from "react";
import { Activity, Dumbbell, TrendingUp, Users } from "lucide-react";
import StatCard from "../components/StatCard.jsx";
import ProgressChart from "../components/ProgressChart.jsx";
import { progressLogs } from "../data/mockData.js";

export default function Dashboard({ students, workouts, onNavigate }) {
  const activeWorkouts = workouts.filter((workout) => workout.status === "Ativo").length;
  const totalExercises = workouts.reduce((sum, workout) => sum + workout.exercises.length, 0);

  return (
    <div className="page-grid">
      <section className="stats-grid">
        <StatCard icon={Users} label="Alunos" value={students.length} detail="3 novos check-ins hoje" />
        <StatCard icon={Dumbbell} label="Treinos ativos" value={activeWorkouts} detail={`${totalExercises} exercícios prescritos`} />
        <StatCard icon={TrendingUp} label="Progresso geral" value="87%" detail="Aderência média mensal" />
        <StatCard icon={Activity} label="Sessões concluídas" value="128" detail="Volume acumulado no mês" />
      </section>
      <section className="dashboard-layout">
        <ProgressChart data={progressLogs} />
        <article className="command-panel">
          <p className="eyebrow">Hoje</p>
          <h2>Prioridades do estúdio</h2>
          <div className="task-list">
            <button type="button" onClick={() => onNavigate("students")}>
              Revisar alunos com aderência abaixo de 80%
              <span>3 alunos</span>
            </button>
            <button type="button" onClick={() => onNavigate("workout-builder")}>
              Atualizar vídeos dos treinos de força
              <span>5 exercícios</span>
            </button>
            <button type="button" onClick={() => onNavigate("progress")}>
              Conferir evolução corporal de maio
              <span>Relatório</span>
            </button>
          </div>
        </article>
      </section>
    </div>
  );
}
