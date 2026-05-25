import React from "react";
import { CheckCircle2, Circle, Dumbbell } from "lucide-react";
import { useMemo, useState } from "react";

export default function StudentPortal({ workout, completed, onToggleExercise }) {
  const [loads, setLoads] = useState({});
  const percent = useMemo(() => Math.round((workout.exercises.filter((exercise) => completed.has(exercise.id)).length / workout.exercises.length) * 100), [workout, completed]);

  return (
    <section className="student-portal">
      <div className="today-panel">
        <p className="eyebrow">Treino do dia</p>
        <h2>{workout.name}</h2>
        <span>{workout.focus} · {workout.duration}</span>
        <div className="progress-ring" style={{ "--value": `${percent}%` }}>
          <strong>{percent}%</strong>
          <small>concluído</small>
        </div>
      </div>
      <div className="exercise-checklist">
        {workout.exercises.map((exercise) => {
          const isDone = completed.has(exercise.id);
          return (
            <article className={`check-card ${isDone ? "done" : ""}`} key={exercise.id}>
              <button type="button" onClick={() => onToggleExercise(exercise.id)} aria-label="Concluir exercício">
                {isDone ? <CheckCircle2 size={25} /> : <Circle size={25} />}
              </button>
              <div>
                <h3>{exercise.name}</h3>
                <p>{exercise.sets} séries · {exercise.reps} reps · {exercise.rest} descanso</p>
                <label>
                  <Dumbbell size={16} />
                  <input
                    value={loads[exercise.id] || exercise.load}
                    onChange={(event) => setLoads((current) => ({ ...current, [exercise.id]: event.target.value }))}
                    placeholder="Registrar carga"
                  />
                </label>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
