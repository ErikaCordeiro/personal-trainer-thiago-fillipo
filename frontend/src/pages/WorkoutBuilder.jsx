import React from "react";
import { Brain, Link, Plus, Save, Upload, Video } from "lucide-react";
import { useMemo, useState } from "react";
import { exerciseCatalog } from "../data/mockData.js";

const blankExercise = {
  name: "",
  sets: 4,
  reps: "10",
  rest: "60s",
  load: "",
  explanation: "",
  videoUrl: "",
  videoFile: ""
};

const preferredInstructor = "Leandro Twin";

const buildInstructorYoutubeUrl = (exerciseName) => {
  const query = encodeURIComponent(`${preferredInstructor} ${exerciseName} execução correta`);
  return `https://www.youtube.com/results?search_query=${query}`;
};

export default function WorkoutBuilder({ students, workouts, onOpenExercise, onSaveWorkout }) {
  const [exercises, setExercises] = useState([{ ...blankExercise, id: crypto.randomUUID() }]);
  const [activeSuggestId, setActiveSuggestId] = useState(null);
  const [editingWorkout, setEditingWorkout] = useState(null);

  const workoutHistory = useMemo(
    () => [...workouts].sort((a, b) => a.name.localeCompare(b.name)),
    [workouts]
  );

  const updateExercise = (id, field, value) => {
    setExercises((current) => current.map((exercise) => exercise.id === id ? { ...exercise, [field]: value } : exercise));
  };

  const applySuggestion = (id, suggestion) => {
    setExercises((current) => current.map((exercise) => {
      if (exercise.id !== id) return exercise;
      return {
        ...exercise,
        name: suggestion.name,
        explanation: suggestion.explanation,
        videoUrl: buildInstructorYoutubeUrl(suggestion.name)
      };
    }));
    setActiveSuggestId(null);
  };

  const addExercise = () => setExercises((current) => [...current, { ...blankExercise, id: crypto.randomUUID() }]);

  const submit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSaveWorkout({
      id: editingWorkout?.id || crypto.randomUUID(),
      name: form.get("name"),
      studentId: form.get("studentId"),
      status: "Historico",
      focus: form.get("focus"),
      duration: form.get("duration"),
      date: form.get("date") || "Segunda",
      exercises: exercises.map((exercise) => ({ ...exercise, done: false }))
    });
    setEditingWorkout(null);
    setExercises([{ ...blankExercise, id: crypto.randomUUID() }]);
  };

  const editWorkout = (workout) => {
    setEditingWorkout(workout);
    setExercises(workout.exercises.map((exercise) => ({ ...blankExercise, ...exercise, id: exercise.id || crypto.randomUUID() })));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="workout-layout">
      <form className="form-panel" onSubmit={submit}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">{editingWorkout ? "Editando treino" : "Protocolos"}</p>
            <h2>{editingWorkout ? editingWorkout.name : "Criar treino"}</h2>
          </div>
          <button className="metal-button inline" type="submit"><Save size={18} /> {editingWorkout ? "Salvar edicao" : "Salvar treino"}</button>
        </div>
        <div className="form-grid">
          <label><span>Nome do treino</span><input name="name" key={`name-${editingWorkout?.id || "new"}`} defaultValue={editingWorkout?.name || "Novo treino personalizado"} required /></label>
          <label><span>Aluno</span><select name="studentId" key={`student-${editingWorkout?.id || "new"}`} defaultValue={editingWorkout?.studentId || students[0]?.id}>{students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</select></label>
          <label><span>Foco</span><input name="focus" key={`focus-${editingWorkout?.id || "new"}`} defaultValue={editingWorkout?.focus || "Forca, hipertrofia e cardio"} /></label>
          <label><span>Duracao</span><input name="duration" key={`duration-${editingWorkout?.id || "new"}`} defaultValue={editingWorkout?.duration || "60 min"} /></label>
          <label><span>Dia da semana</span><select name="date" key={`date-${editingWorkout?.id || "new"}`} defaultValue={editingWorkout?.date || "Segunda"}>{["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map((day) => <option key={day} value={day}>{day}</option>)}</select></label>
        </div>
        <div className="exercise-builder">
          {exercises.map((exercise, index) => {
            const suggestions = exercise.name.trim().length > 1
              ? exerciseCatalog
                .filter((item) => `${item.name} ${item.muscle}`.toLowerCase().includes(exercise.name.toLowerCase()))
                .slice(0, 4)
              : [];

            return (
              <article className="exercise-row" key={exercise.id}>
                <div className="exercise-row-title">
                  <strong>Exercicio {index + 1}</strong>
                  <span><Brain size={15} /> IA busca exercicios pelo nome digitado</span>
                </div>
                <div className="form-grid compact">
                  <div className="exercise-search-field">
                    <input
                      placeholder="Nome do exercicio"
                      value={exercise.name}
                      onFocus={() => setActiveSuggestId(exercise.id)}
                      onChange={(event) => {
                        updateExercise(exercise.id, "name", event.target.value);
                        setActiveSuggestId(exercise.id);
                      }}
                      required
                    />
                    {activeSuggestId === exercise.id && suggestions.length > 0 && (
                      <div className="exercise-suggestions">
                        {suggestions.map((suggestion) => (
                          <button key={suggestion.name} type="button" onClick={() => applySuggestion(exercise.id, suggestion)}>
                            <strong>{suggestion.name}</strong>
                            <span>{suggestion.muscle} - Video disponivel com {preferredInstructor}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input placeholder="Series" type="number" value={exercise.sets} onChange={(event) => updateExercise(exercise.id, "sets", Number(event.target.value))} />
                  <input placeholder="Repeticoes" value={exercise.reps} onChange={(event) => updateExercise(exercise.id, "reps", event.target.value)} />
                  <input placeholder="Descanso" value={exercise.rest} onChange={(event) => updateExercise(exercise.id, "rest", event.target.value)} />
                  <input placeholder="Carga" value={exercise.load} onChange={(event) => updateExercise(exercise.id, "load", event.target.value)} />
                  <label className="video-input">
                    <span><Link size={15} /> Link do YouTube</span>
                    <input placeholder="https://youtube.com/..." value={exercise.videoUrl} onChange={(event) => updateExercise(exercise.id, "videoUrl", event.target.value)} />
                    {exercise.videoUrl && (
                      <a className="recommended-video-link" href={exercise.videoUrl} target="_blank" rel="noreferrer">
                        Video recomendado disponivel - {preferredInstructor}
                      </a>
                    )}
                  </label>
                  <label className="video-input">
                    <span><Upload size={15} /> Upload de video</span>
                    <input type="file" accept="video/*" onChange={(event) => updateExercise(exercise.id, "videoFile", event.target.files?.[0]?.name || "")} />
                  </label>
                  <textarea placeholder="Observacoes e execucao" value={exercise.explanation} onChange={(event) => updateExercise(exercise.id, "explanation", event.target.value)} />
                </div>
                {exercise.videoFile && <small className="upload-name">Video selecionado: {exercise.videoFile}</small>}
              </article>
            );
          })}
        </div>
        <div className="builder-actions">
          <button className="ghost-button" type="button" onClick={addExercise}><Plus size={18} /> Adicionar exercicio</button>
          {editingWorkout && (
            <button className="ghost-button" type="button" onClick={() => { setEditingWorkout(null); setExercises([{ ...blankExercise, id: crypto.randomUUID() }]); }}>
              Novo treino
            </button>
          )}
        </div>
      </form>
      <aside className="workout-list">
        <p className="eyebrow">Historico</p>
        <h2>Historico de treinos</h2>
        {workoutHistory.map((workout) => (
          <article key={workout.id} className={`workout-card ${editingWorkout?.id === workout.id ? "active-edit" : ""}`}>
            <div className="workout-card-header" onClick={() => editWorkout(workout)} role="button" tabIndex="0">
              <strong>{workout.name}</strong>
              <span>{workout.date || "Treino"} - {workout.focus} - {workout.duration}</span>
              <small>Clique para editar este treino</small>
            </div>
            {workout.exercises.map((exercise) => (
              <button key={exercise.id} type="button" onClick={() => onOpenExercise(exercise)}>
                <Video size={16} /> {exercise.name}
              </button>
            ))}
          </article>
        ))}
      </aside>
    </section>
  );
}
