import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Clock, Dumbbell, Pause, Play, Square } from "lucide-react";

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function toYoutubeWatchUrl(videoUrl) {
  if (!videoUrl) return "";
  return videoUrl.replace("/embed/", "/watch?v=");
}

function canEmbedYoutube(videoUrl) {
  return videoUrl?.includes("youtube.com/embed/");
}

export default function WorkoutExecution({ workout, completed, onBack, onToggleExercise, onFinishWorkout }) {
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [started, setStarted] = useState(false);
  const [currentId, setCurrentId] = useState(workout.exercises[0]?.id);
  const [loadModalOpen, setLoadModalOpen] = useState(false);
  const [loadValue, setLoadValue] = useState("");
  const [loadNote, setLoadNote] = useState("");
  const [loadError, setLoadError] = useState("");
  const [savedLoads, setSavedLoads] = useState({});
  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const [intensity, setIntensity] = useState("");
  const [finishNote, setFinishNote] = useState("");
  const [finishSuccess, setFinishSuccess] = useState(false);

  useEffect(() => {
    setElapsed(0);
    setPaused(false);
    setStarted(false);
    setCurrentId(workout.exercises[0]?.id);
    setLoadModalOpen(false);
    setLoadValue("");
    setLoadNote("");
    setLoadError("");
    setSavedLoads({});
    setFinishModalOpen(false);
    setIntensity("");
    setFinishNote("");
    setFinishSuccess(false);
  }, [workout.id, workout.exercises]);

  useEffect(() => {
    if (!started) return undefined;
    if (paused) return undefined;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [paused, started]);

  const currentIndex = Math.max(0, workout.exercises.findIndex((exercise) => exercise.id === currentId));
  const doneCount = workout.exercises.filter((exercise) => completed.has(exercise.id)).length;
  const percent = Math.round((doneCount / workout.exercises.length) * 100);
  const currentExercise = workout.exercises[currentIndex] || workout.exercises[0];

  const stats = useMemo(() => ([
    ["Duração", workout.duration || "60 min", Clock],
    ["Exercícios", `${workout.exercises.length}`, Dumbbell],
    ["Calorias", "420 kcal", Play],
    ["Volume", "12.450 kg", Square]
  ]), [workout]);

  const finishCurrent = () => {
    if (!currentExercise) return;
    setLoadValue(savedLoads[currentExercise.id]?.load || "");
    setLoadNote(savedLoads[currentExercise.id]?.note || "");
    setLoadError("");
    setLoadModalOpen(true);
  };

  const saveAndFinishCurrent = () => {
    const numericLoad = Number(String(loadValue).replace(",", "."));
    if (!Number.isFinite(numericLoad) || numericLoad <= 0) {
      setLoadError("Informe uma carga válida maior que zero.");
      return;
    }
    setSavedLoads((current) => ({
      ...current,
      [currentExercise.id]: {
        load: loadValue,
        note: loadNote,
        date: new Date().toISOString(),
        elapsed
      }
    }));
    if (!completed.has(currentExercise.id)) {
      onToggleExercise(currentExercise.id);
    }
    const next = workout.exercises.find((exercise) => exercise.id !== currentExercise.id && !completed.has(exercise.id));
    if (next) setCurrentId(next.id);
    setLoadModalOpen(false);
  };

  const finishWorkout = () => {
    setFinishSuccess(true);
    setElapsed(0);
    setPaused(false);
    setStarted(false);
    setCurrentId(workout.exercises[0]?.id);
    setSavedLoads({});
    window.setTimeout(() => {
      onFinishWorkout?.();
      onBack();
    }, 900);
  };

  return (
    <section className="workout-execution-page">
      <article className="execution-header-card">
        <button type="button" className="ghost-button" onClick={onBack}>
          <ArrowLeft size={18} />
          Voltar
        </button>
        <div>
          <p className="eyebrow">Treino do dia</p>
          <h2>{workout.name}</h2>
          <span>{workout.focus}</span>
        </div>
        <div className="execution-timer">
          <strong>{formatTime(elapsed)}</strong>
          <span>{!started ? "Não iniciado" : paused ? "Pausado" : "Em andamento"}</span>
        </div>
      </article>

      <section className="execution-stats-grid">
        {stats.map(([label, value, Icon]) => (
          <article key={label}>
            <Icon size={20} />
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>

      <section className="execution-layout">
        <div className="execution-list">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Exercícios</p>
              <h2>{doneCount} de {workout.exercises.length} concluídos</h2>
            </div>
            <div className="mini-progress workout-mini-progress"><span style={{ width: `${percent}%` }} /></div>
          </div>

          {workout.exercises.map((exercise, index) => {
            const done = completed.has(exercise.id);
            const active = exercise.id === currentId;
            return (
              <article
                key={exercise.id}
                className={`execution-exercise-card ${active ? "active" : ""} ${done ? "done" : ""}`}
                onClick={() => setCurrentId(exercise.id)}
              >
                <label className="exercise-check">
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={(event) => {
                      event.stopPropagation();
                      if (!done) {
                        setCurrentId(exercise.id);
                        setLoadValue(savedLoads[exercise.id]?.load || "");
                        setLoadNote(savedLoads[exercise.id]?.note || "");
                        setLoadError("");
                        setLoadModalOpen(true);
                      }
                    }}
                    onClick={(event) => event.stopPropagation()}
                    aria-label={`Status ${exercise.name}`}
                  />
                  <span>{index + 1}</span>
                </label>
                <div>
                  <h3>{exercise.name}</h3>
                  <p>{exercise.sets} séries · {exercise.reps} repetições</p>
                  <small>Descanso: {exercise.rest} · Carga sugerida: {exercise.load}</small>
                  {exercise.videoUrl && (
                    <div className="exercise-video-mini" onClick={(event) => event.stopPropagation()}>
                      {canEmbedYoutube(exercise.videoUrl) && (
                        <iframe
                          src={exercise.videoUrl}
                          title={`Video de execu??o - ${exercise.name}`}
                          loading="lazy"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      )}
                      <a href={toYoutubeWatchUrl(exercise.videoUrl)} target="_blank" rel="noreferrer">
                        {canEmbedYoutube(exercise.videoUrl) ? "Abrir no YouTube" : "Ver video recomendado"}
                      </a>
                    </div>
                  )}
                  {savedLoads[exercise.id] && <em>Carga usada: {savedLoads[exercise.id].load} kg</em>}
                </div>
              </article>
            );
          })}
        </div>

        <aside className="execution-control-panel">
          <p className="eyebrow">Exercício atual</p>
          <strong>{currentIndex + 1} de {workout.exercises.length}</strong>
          <h2>{currentExercise?.name}</h2>
          <span>{currentExercise?.sets} séries · {currentExercise?.reps}</span>
          <div className="progress-ring neon-ring" style={{ "--value": `${percent}%` }}>
            <strong>{formatTime(elapsed)}</strong>
            <small>Treino</small>
          </div>
          <div className="execution-actions">
            {!started && (
              <button type="button" onClick={() => setStarted(true)}>
                <Play size={18} />
                Iniciar treino
              </button>
            )}
            <button type="button" onClick={() => setPaused((value) => !value)}>
              {paused ? <Play size={18} /> : <Pause size={18} />}
              {paused ? "Continuar" : "Pausar"}
            </button>
            <button type="button" onClick={finishCurrent}>Concluir exercicio</button>
            <button type="button" onClick={() => setFinishModalOpen(true)}>Finalizar treino</button>
          </div>
        </aside>
      </section>

      {loadModalOpen && (
        <div className="modal-backdrop">
          <form
            className="student-modal load-modal"
            onSubmit={(event) => {
              event.preventDefault();
              saveAndFinishCurrent();
            }}
          >
            <div className="section-heading">
              <div>
                <p className="eyebrow">Finalizar exercício</p>
                <h2>Quantos kg você usou?</h2>
                <span>{currentExercise?.name}</span>
              </div>
            </div>
            <label>
              <span>Carga usada em kg</span>
              <input
                autoFocus
                inputMode="decimal"
                value={loadValue}
                onChange={(event) => setLoadValue(event.target.value)}
                placeholder="Ex: 12.5"
              />
            </label>
            <label>
              <span>Observação opcional</span>
              <textarea
                value={loadNote}
                onChange={(event) => setLoadNote(event.target.value)}
                placeholder="Como foi a execução?"
              />
            </label>
            {loadError && <p className="form-error">{loadError}</p>}
            <div className="modal-actions">
              <button className="ghost-button" type="button" onClick={() => setLoadModalOpen(false)}>Cancelar</button>
              <button className="metal-button inline" type="submit">Salvar e finalizar exercício</button>
            </div>
          </form>
        </div>
      )}

      {finishModalOpen && (
        <div className="modal-backdrop">
          <form
            className="student-modal load-modal"
            onSubmit={(event) => {
              event.preventDefault();
              finishWorkout();
            }}
          >
            <div className="section-heading">
              <div>
                <p className="eyebrow">Finalizar treino</p>
                <h2>Qual foi a intensidade do treino?</h2>
                <span>{workout.name}</span>
              </div>
            </div>
            <label>
              <span>Intensidade</span>
              <select value={intensity} onChange={(event) => setIntensity(event.target.value)} required>
                <option value="">Selecione uma opção</option>
                <option value="leve">Leve</option>
                <option value="moderado">Moderado</option>
                <option value="intenso">Intenso</option>
                <option value="muito-intenso">Muito intenso</option>
                <option value="exaustivo">Exaustivo</option>
              </select>
            </label>
            <label>
              <span>Observação opcional</span>
              <textarea
                value={finishNote}
                onChange={(event) => setFinishNote(event.target.value)}
                placeholder="Como você se sentiu hoje?"
              />
            </label>
            {finishSuccess && <p className="form-error">Treino finalizado com sucesso!</p>}
            <div className="modal-actions">
              <button className="ghost-button" type="button" onClick={() => setFinishModalOpen(false)}>Voltar</button>
              <button className="metal-button inline" type="submit">Enviar feedback</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
