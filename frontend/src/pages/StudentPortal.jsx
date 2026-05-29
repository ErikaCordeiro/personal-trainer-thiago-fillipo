import React, { useMemo, useRef, useState } from "react";
import { CheckCircle2, Circle, Clock, Dumbbell, Flame, Play, Video } from "lucide-react";

const weekDays = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

function normalizeDay(value = "") {
  const text = String(value).toLowerCase();
  return weekDays.find((day) => text.includes(day.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")) || text.includes(day.toLowerCase())) || null;
}

export default function StudentPortal({ workout, workouts = [], completed, onStartWorkout, onToggleExercise }) {
  const [loads, setLoads] = useState({});
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(null);
  const exercisesRef = useRef(null);
  const availableWorkouts = workouts.length ? workouts : [workout];
  const selectedWorkout = availableWorkouts.find((item) => item.id === selectedWorkoutId) || workout;

  const workoutsByDay = useMemo(() => {
    const grouped = Object.fromEntries(weekDays.map((day) => [day, []]));
    availableWorkouts.forEach((item, index) => {
      const day = normalizeDay(item.date) || weekDays[index % weekDays.length];
      grouped[day].push(item);
    });
    return grouped;
  }, [availableWorkouts]);

  const percent = useMemo(() => {
    const done = selectedWorkout.exercises.filter((exercise) => completed.has(exercise.id)).length;
    return Math.round((done / selectedWorkout.exercises.length) * 100);
  }, [selectedWorkout, completed]);

  return (
    <section className="student-training-page">
      <article className="training-hero-card">
        <div>
          <p className="eyebrow">Treino do dia</p>
          <h2>{selectedWorkout.name}</h2>
          <span>{selectedWorkout.date || "Hoje"} - {selectedWorkout.focus} - {selectedWorkout.duration}</span>
          <div className="training-facts">
            <span><Dumbbell size={17} />{selectedWorkout.exercises.length} exercícios</span>
            <span><Clock size={17} />{selectedWorkout.duration}</span>
            <span><Flame size={17} />420 kcal</span>
          </div>
          <button type="button" onClick={() => onStartWorkout?.(selectedWorkout.id)}>
            Acessar treino <Play size={16} />
          </button>
        </div>
        <div className="training-ring">
          <div className="progress-ring neon-ring" style={{ "--value": `${percent}%` }}>
            <strong>{percent}%</strong>
            <small>concluído</small>
          </div>
        </div>
      </article>

      <article className="full-workout-panel weekly-workout-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Meu treino completo</p>
            <h2>Segunda a domingo</h2>
            <span>Escolha o treino do dia para visualizar os exercícios.</span>
          </div>
          <span className="status-pill">{availableWorkouts.length} treinos</span>
        </div>

        <div className="weekly-workout-grid">
          {weekDays.map((day) => {
            const dayWorkouts = workoutsByDay[day] || [];
            return (
              <article className="weekday-card" key={day}>
                <header>
                  <strong>{day}</strong>
                  <span>{dayWorkouts.length ? `${dayWorkouts.length} treino(s)` : "Descanso"}</span>
                </header>
                {dayWorkouts.length ? dayWorkouts.map((item) => (
                  <button
                    key={item.id}
                    className={selectedWorkout.id === item.id ? "active" : ""}
                    type="button"
                    onClick={() => {
                      setSelectedWorkoutId(item.id);
                      window.setTimeout(() => exercisesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
                    }}
                  >
                    <strong>{item.name}</strong>
                    <small>{item.focus}</small>
                    <em>{item.duration}</em>
                  </button>
                )) : <p>Dia livre para recuperação, mobilidade ou cardio leve.</p>}
              </article>
            );
          })}
        </div>
      </article>

      {selectedWorkoutId && (
      <article className="selected-workout-panel" ref={exercisesRef}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Exercícios</p>
            <h2>{selectedWorkout.name}</h2>
            <span>{selectedWorkout.focus} - {selectedWorkout.exercises.length} exercícios</span>
          </div>
          <div className="mini-progress workout-mini-progress"><span style={{ width: `${percent}%` }} /></div>
        </div>

        <div className="exercise-checklist premium-exercise-list">
          {selectedWorkout.exercises.map((exercise, index) => {
            const isDone = completed.has(exercise.id);
            return (
              <article className={`check-card ${isDone ? "done" : ""}`} key={exercise.id}>
                <button type="button" onClick={() => onToggleExercise(exercise.id)} aria-label="Concluir exercício">
                  {isDone ? <CheckCircle2 size={25} /> : <Circle size={25} />}
                </button>
                <div>
                  <small>Exercício {index + 1}</small>
                  <h3>{exercise.name}</h3>
                  <p>{exercise.sets} séries - {exercise.reps} reps - {exercise.rest} descanso</p>
                  <div className="student-exercise-actions">
                    <label>
                      <Dumbbell size={16} />
                      <input
                        value={loads[exercise.id] || exercise.load}
                        onChange={(event) => setLoads((current) => ({ ...current, [exercise.id]: event.target.value }))}
                        placeholder="Registrar carga"
                      />
                    </label>
                    {exercise.videoUrl && (
                      <a href={exercise.videoUrl.replace("/embed/", "/watch?v=")} target="_blank" rel="noreferrer">
                        <Video size={16} /> Ver vídeo
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </article>
      )}
    </section>
  );
}
