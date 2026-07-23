import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Dumbbell,
  Minus,
  Pause,
  Play,
  Plus,
  Save,
  Star,
  Video,
  X
} from "lucide-react";

const EXECUTION_PREFIX = "ptf_workout_execution_v2";
const HISTORY_KEY = "ptf_workout_history_v2";
const STUDENT_ID = "student-erika";

function nowIso() {
  return new Date().toISOString();
}

function formatTime(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(safe / 3600).toString().padStart(2, "0");
  const m = Math.floor((safe % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(safe % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function shortDate(date = new Date()) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function parseRestSeconds(rest) {
  const match = String(rest || "60").match(/\d+/);
  return match ? Number(match[0]) : 60;
}

function playRestDoneSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.14, context.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.34);
    gain.connect(context.destination);
    [660, 880].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, context.currentTime + index * 0.1);
      oscillator.connect(gain);
      oscillator.start(context.currentTime + index * 0.1);
      oscillator.stop(context.currentTime + 0.32 + index * 0.1);
    });
    window.setTimeout(() => context.close?.(), 700);
  } catch {
    // Som pode ser bloqueado pelo navegador ate uma interacao do usuario.
  }
}

function parseSeriesCount(sets) {
  const match = String(sets || "3").match(/\d+/);
  return Math.max(1, match ? Number(match[0]) : 3);
}

function getExecutionKey(workoutId) {
  return `${EXECUTION_PREFIX}:${STUDENT_ID}:${workoutId}`;
}

function toYoutubeWatchUrl(videoUrl) {
  if (!videoUrl) return "";
  if (videoUrl.includes("/embed/")) return videoUrl.replace("/embed/", "/watch?v=");
  return videoUrl;
}

function toYoutubeEmbedUrl(videoUrl) {
  if (!videoUrl) return "";
  if (videoUrl.includes("/embed/")) return videoUrl;
  if (videoUrl.includes("watch?v=")) return videoUrl.replace("watch?v=", "embed/");
  return videoUrl;
}

function buildInitialExecution(workout) {
  return {
    id: `exec-${workout.id}-${Date.now()}`,
    studentId: STUDENT_ID,
    workoutId: workout.id,
    status: "nao_iniciado",
    startedAt: null,
    pausedAt: null,
    resumedAt: null,
    completedAt: null,
    accumulatedDuration: 0,
    activeSince: null,
    currentExerciseId: workout.exercises[0]?.id || null,
    currentSetNumber: 1,
    rest: null,
    feedback: null,
    updatedAt: nowIso(),
    exercises: workout.exercises.map((exercise, index) => {
      const totalSets = parseSeriesCount(exercise.sets);
      return {
        exerciseId: exercise.id,
        position: index + 1,
        status: "pendente",
        startedAt: null,
        completedAt: null,
        expanded: index === 0,
        sets: Array.from({ length: totalSets }, (_, setIndex) => ({
          setNumber: setIndex + 1,
          prescribedReps: exercise.reps || "",
          prescribedLoad: exercise.load || "",
          status: "pendente",
          usedLoad: "",
          completedReps: "",
          observation: "",
          startedAt: null,
          completedAt: null,
          duration: 0
        }))
      };
    })
  };
}

function normalizeExecution(saved, workout) {
  const initial = buildInitialExecution(workout);
  if (!saved || saved.workoutId !== workout.id) return initial;
  const savedMap = new Map((saved.exercises || []).map((item) => [item.exerciseId, item]));
  return {
    ...initial,
    ...saved,
    exercises: initial.exercises.map((initialExercise) => {
      const savedExercise = savedMap.get(initialExercise.exerciseId);
      if (!savedExercise) return initialExercise;
      const savedSets = new Map((savedExercise.sets || []).map((set) => [set.setNumber, set]));
      return {
        ...initialExercise,
        ...savedExercise,
        sets: initialExercise.sets.map((set) => ({ ...set, ...(savedSets.get(set.setNumber) || {}) }))
      };
    })
  };
}

function loadExecution(workout) {
  try {
    const raw = window.localStorage.getItem(getExecutionKey(workout.id));
    return normalizeExecution(raw ? JSON.parse(raw) : null, workout);
  } catch {
    return buildInitialExecution(workout);
  }
}

function liveElapsed(execution) {
  if (!execution) return 0;
  if (execution.status !== "em_andamento" || !execution.activeSince) return execution.accumulatedDuration || 0;
  return (execution.accumulatedDuration || 0) + Math.floor((Date.now() - new Date(execution.activeSince).getTime()) / 1000);
}

function setTotals(execution) {
  const sets = execution.exercises.flatMap((exercise) => exercise.sets);
  return {
    total: sets.length,
    done: sets.filter((set) => set.status === "concluida").length
  };
}

function exerciseTotals(execution) {
  return {
    total: execution.exercises.length,
    done: execution.exercises.filter((exercise) => exercise.status === "concluido").length
  };
}

function maxLoadText(exerciseExecution) {
  const values = exerciseExecution.sets.map((set) => set.usedLoad).filter(Boolean);
  return values[values.length - 1] || "-";
}

function saveHistory(execution, workout, duration, finishStatus) {
  const exerciseSummary = execution.exercises.map((item) => {
    const source = workout.exercises.find((exercise) => exercise.id === item.exerciseId);
    return {
      exerciseId: item.exerciseId,
      name: source?.name || "Exercício",
      status: item.status,
      sets: item.sets,
      maxLoad: maxLoadText(item)
    };
  });
  const completedSets = exerciseSummary.flatMap((exercise) => exercise.sets).filter((set) => set.status === "concluida");
  const numericVolume = completedSets.reduce((sum, set) => {
    const load = Number(String(set.usedLoad).replace(",", ".").replace(/[^0-9.]/g, ""));
    const reps = Number(String(set.completedReps).replace(/[^0-9]/g, ""));
    return sum + (Number.isFinite(load) && Number.isFinite(reps) ? load * reps : 0);
  }, 0);
  const record = {
    id: `hist-${execution.id}-${Date.now()}`,
    studentId: execution.studentId,
    workoutId: workout.id,
    workoutName: workout.name,
    date: nowIso(),
    displayDate: shortDate(),
    duration,
    durationLabel: formatTime(duration),
    status: finishStatus,
    exercisesDone: exerciseTotals(execution).done,
    exercisesTotal: execution.exercises.length,
    setsDone: completedSets.length,
    setsTotal: exerciseSummary.flatMap((exercise) => exercise.sets).length,
    volume: Math.round(numericVolume),
    maxLoad: numericLoads.length ? `${Math.max(...numericLoads).toLocaleString("pt-BR")} kg` : "-",
    averageLoad: numericLoads.length ? Math.round(numericLoads.reduce((sum, value) => sum + value, 0) / numericLoads.length) : 0,
    repsTotal,
    estimatedCalories: Math.max(120, Math.round((duration / 60) * 7)),
    feedback: execution.feedback,
    exercises: exerciseSummary
  };
  try {
    const current = JSON.parse(window.localStorage.getItem(HISTORY_KEY) || "[]");
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify([record, ...current].slice(0, 40)));
  } catch {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify([record]));
  }
  return record;
}

export default function WorkoutExecution({ workout, onBack, onToggleExercise, onFinishWorkout }) {
  const [execution, setExecution] = useState(() => loadExecution(workout));
  const [tick, setTick] = useState(Date.now());
  const [setModal, setSetModal] = useState(null);
  const [videoExercise, setVideoExercise] = useState(null);
  const [finishOpen, setFinishOpen] = useState(false);
  const [confirmIncomplete, setConfirmIncomplete] = useState(false);
  const [saving, setSaving] = useState("Salvo");
  const [restFinishedNotice, setRestFinishedNotice] = useState(false);
  const [feedback, setFeedback] = useState({
    feeling: "Bem",
    difficulty: "Moderado",
    rating: 5,
    hadPain: "Não",
    painArea: "",
    painIntensity: "0",
    observation: ""
  });

  useEffect(() => {
    setExecution(loadExecution(workout));
  }, [workout.id]);

  useEffect(() => {
    const timer = window.setInterval(() => setTick(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      setSaving("Salvando...");
      window.localStorage.setItem(getExecutionKey(workout.id), JSON.stringify({ ...execution, updatedAt: nowIso() }));
      const id = window.setTimeout(() => setSaving(navigator.onLine ? "Salvo" : "Sem conexão - os dados serão sincronizados"), 250);
      return () => window.clearTimeout(id);
    } catch {
      setSaving("Sem conexão - os dados serão sincronizados");
    }
    return undefined;
  }, [execution, workout.id, tick]);

  useEffect(() => {
    const persist = () => {
      try {
        window.localStorage.setItem(getExecutionKey(workout.id), JSON.stringify({ ...execution, updatedAt: nowIso() }));
      } catch {
        // localStorage can fail in private browsing; the UI keeps the in-memory state.
      }
    };
    window.addEventListener("pagehide", persist);
    window.addEventListener("beforeunload", persist);
    document.addEventListener("visibilitychange", persist);
    return () => {
      window.removeEventListener("pagehide", persist);
      window.removeEventListener("beforeunload", persist);
      document.removeEventListener("visibilitychange", persist);
    };
  }, [execution, workout.id]);

  const elapsed = liveElapsed(execution);
  const exercises = exerciseTotals(execution);
  const sets = setTotals(execution);
  const percent = sets.total ? Math.round((sets.done / sets.total) * 100) : 0;
  const currentExecution = execution.exercises.find((item) => item.exerciseId === execution.currentExerciseId) || execution.exercises[0];
  const currentExercise = workout.exercises.find((item) => item.id === currentExecution?.exerciseId) || workout.exercises[0];
  const currentSet = currentExecution?.sets.find((set) => set.status === "em_andamento") || currentExecution?.sets.find((set) => set.status === "pendente") || currentExecution?.sets.at(-1);
  const restSeconds = execution.rest?.status === "em_andamento" ? Math.max(0, Math.ceil((new Date(execution.rest.restEndsAt).getTime() - Date.now()) / 1000)) : 0;

  useEffect(() => {
    if (execution.rest?.status === "em_andamento" && restSeconds <= 0) {
      if (navigator.vibrate) navigator.vibrate([120, 60, 120]);
      playRestDoneSound();
      setRestFinishedNotice(true);
      window.setTimeout(() => setRestFinishedNotice(false), 2800);
      setExecution((prev) => ({
        ...prev,
        rest: { ...prev.rest, status: "concluido", completedAt: nowIso(), completedRestSeconds: prev.rest.selectedSeconds },
        updatedAt: nowIso()
      }));
    }
  }, [execution.rest?.status, restSeconds]);

  function updateExercise(exerciseId, updater) {
    setExecution((prev) => ({
      ...prev,
      exercises: prev.exercises.map((item) => item.exerciseId === exerciseId ? updater(item) : item),
      updatedAt: nowIso()
    }));
  }

  function toggleExercise(exerciseId) {
    setExecution((prev) => ({
      ...prev,
      currentExerciseId: exerciseId,
      exercises: prev.exercises.map((item) => item.exerciseId === exerciseId ? { ...item, expanded: !item.expanded } : item),
      updatedAt: nowIso()
    }));
  }

  function focusExercise(exerciseId) {
    setExecution((prev) => ({
      ...prev,
      currentExerciseId: exerciseId,
      exercises: prev.exercises.map((item) => item.exerciseId === exerciseId ? { ...item, expanded: true } : item),
      updatedAt: nowIso()
    }));
  }

  function startSet(targetExerciseId = currentExecution?.exerciseId, targetSetNumber = currentSet?.setNumber, options = {}) {
    if (!targetExerciseId || !targetSetNumber || execution.status === "pausado" || execution.rest?.status === "em_andamento") return;
    const targetExercise = execution.exercises.find((item) => item.exerciseId === targetExerciseId);
    const targetSet = targetExercise?.sets.find((set) => set.setNumber === targetSetNumber);
    if (!targetExercise || !targetSet || targetSet.status === "concluida") return;
    if (targetSet.status === "em_andamento") {
      openCompleteSetModal(targetExerciseId, targetSetNumber);
      return;
    }
    const startStamp = nowIso();
    setExecution((prev) => ({
      ...prev,
      status: prev.status === "nao_iniciado" ? "em_andamento" : prev.status,
      startedAt: prev.startedAt || startStamp,
      activeSince: prev.status === "nao_iniciado" ? startStamp : prev.activeSince,
      currentExerciseId: targetExerciseId,
      currentSetNumber: targetSetNumber,
      exercises: prev.exercises.map((item) => {
        if (item.exerciseId !== targetExerciseId) return item;
        return {
          ...item,
          status: "em_andamento",
          expanded: true,
          startedAt: item.startedAt || startStamp,
          sets: item.sets.map((set) => set.setNumber === targetSetNumber ? { ...set, status: "em_andamento", startedAt: set.startedAt || startStamp } : set)
        };
      }),
      updatedAt: startStamp
    }));
    if (options.openModal) {
      window.setTimeout(() => {
        setSetModal({
          exerciseId: targetExercise.exerciseId,
          setNumber: targetSet.setNumber,
          usedLoad: targetSet.usedLoad || targetSet.prescribedLoad || "",
          completedReps: targetSet.completedReps || targetSet.prescribedReps || "",
          observation: targetSet.observation || ""
        });
      }, 0);
    }
  }

  function handleSetClick(exerciseId, setNumber) {
    const exercise = execution.exercises.find((item) => item.exerciseId === exerciseId);
    const set = exercise?.sets.find((item) => item.setNumber === setNumber);
    if (!set || set.status === "concluida") return;
    startSet(exerciseId, setNumber, { openModal: true });
  }

  function pauseWorkout() {
    setExecution((prev) => {
      if (prev.status !== "em_andamento") return prev;
      return {
        ...prev,
        status: "pausado",
        pausedAt: nowIso(),
        accumulatedDuration: liveElapsed(prev),
        activeSince: null,
        updatedAt: nowIso()
      };
    });
  }

  function resumeWorkout() {
    setExecution((prev) => {
      if (prev.status !== "pausado") return prev;
      return { ...prev, status: "em_andamento", resumedAt: nowIso(), activeSince: nowIso(), updatedAt: nowIso() };
    });
  }

  function openCompleteSetModal(targetExerciseId = currentExecution?.exerciseId, targetSetNumber = currentSet?.setNumber) {
    const targetExercise = execution.exercises.find((item) => item.exerciseId === targetExerciseId);
    const targetSet = targetExercise?.sets.find((set) => set.setNumber === targetSetNumber);
    if (!targetExercise || !targetSet || targetSet.status !== "em_andamento") return;
    setSetModal({
      exerciseId: targetExercise.exerciseId,
      setNumber: targetSet.setNumber,
      usedLoad: targetSet.usedLoad || targetSet.prescribedLoad || "",
      completedReps: targetSet.completedReps || targetSet.prescribedReps || "",
      observation: targetSet.observation || ""
    });
  }

  function completeSet() {
    if (!setModal?.usedLoad.trim() || !setModal?.completedReps.trim()) return;
    const completedAt = nowIso();
    const exerciseSource = workout.exercises.find((item) => item.id === setModal.exerciseId);
    const rest = parseRestSeconds(exerciseSource?.rest);
    let completedExerciseId = null;
    setExecution((prev) => {
      let shouldRest = false;
      const nextExercises = prev.exercises.map((item) => {
        if (item.exerciseId !== setModal.exerciseId) return item;
        const nextSets = item.sets.map((set) => {
          if (set.setNumber !== setModal.setNumber) return set;
          const started = set.startedAt ? new Date(set.startedAt).getTime() : Date.now();
          return {
            ...set,
            status: "concluida",
            usedLoad: setModal.usedLoad,
            completedReps: setModal.completedReps,
            observation: setModal.observation,
            completedAt,
            duration: Math.max(0, Math.floor((Date.now() - started) / 1000))
          };
        });
        const allDone = nextSets.every((set) => set.status === "concluida");
        const hasNext = nextSets.some((set) => set.status === "pendente");
        shouldRest = hasNext && !allDone;
        if (allDone) completedExerciseId = item.exerciseId;
        return { ...item, sets: nextSets, status: allDone ? "concluido" : "em_andamento", completedAt: allDone ? completedAt : item.completedAt, expanded: !allDone };
      });
      return {
        ...prev,
        exercises: nextExercises,
        rest: shouldRest ? {
          status: "em_andamento",
          restStartedAt: completedAt,
          restEndsAt: new Date(Date.now() + rest * 1000).toISOString(),
          prescribedSeconds: rest,
          selectedSeconds: rest,
          completedRestSeconds: 0
        } : null,
        updatedAt: completedAt
      };
    });
    if (completedExerciseId && onToggleExercise) onToggleExercise(completedExerciseId);
    setSetModal(null);
  }

  function adjustRest(delta) {
    setExecution((prev) => {
      if (!prev.rest) return prev;
      const next = Math.max(15, (prev.rest.selectedSeconds || 60) + delta);
      return {
        ...prev,
        rest: { ...prev.rest, selectedSeconds: next, restEndsAt: new Date(Date.now() + next * 1000).toISOString(), status: "em_andamento" },
        updatedAt: nowIso()
      };
    });
  }

  function skipRest() {
    setExecution((prev) => ({ ...prev, rest: null, updatedAt: nowIso() }));
  }

  function requestFinish() {
    const allDone = execution.exercises.every((item) => item.status === "concluido");
    if (!allDone) {
      setConfirmIncomplete(true);
      return;
    }
    setFinishOpen(true);
  }

  function openIncompleteFeedback() {
    setConfirmIncomplete(false);
    setFinishOpen(true);
  }

  function submitFinish() {
    const complete = execution.exercises.every((item) => item.status === "concluido");
    const status = complete ? "concluido" : "incompleto";
    const finalDuration = liveElapsed(execution);
    const finished = {
      ...execution,
      status,
      completedAt: nowIso(),
      accumulatedDuration: finalDuration,
      activeSince: null,
      feedback,
      updatedAt: nowIso()
    };
    setExecution(finished);
    saveHistory(finished, workout, finalDuration, status);
    window.localStorage.removeItem(getExecutionKey(workout.id));
    setFinishOpen(false);
    onFinishWorkout?.(status);
    onBack?.();
  }

  const stats = [
    ["Tempo do treino", formatTime(elapsed), Clock],
    ["Exercícios", `${exercises.done}/${exercises.total}`, Dumbbell],
    ["Séries", `${sets.done}/${sets.total}`, CheckCircle2],
    ["Progresso", `${percent}%`, Save]
  ];

  return (
    <main className="workout-execution-v2 app-page student-mobile-safe">
      <section className="execution-v2-shell">
        <header className="execution-v2-header premium-panel">
          <button className="icon-button" type="button" onClick={onBack} aria-label="Voltar"><ArrowLeft size={18} /></button>
          <div>
            <span className="eyebrow">Treino do dia</span>
            <h2>{workout.name}</h2>
            <p>{workout.focus || "Treino personalizado"}</p>
          </div>
          <span className={`status-pill status-${execution.status}`}>{execution.status.replace("nao_iniciado", "não iniciado").replace("em_andamento", "em andamento")}</span>
        </header>

        <section className="execution-v2-stats">
          {stats.map(([label, value, Icon]) => (
            <article className="execution-v2-stat premium-panel" key={label}>
              <Icon size={18} />
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </section>

        <section className="execution-v2-progress premium-panel">
          <div>
            <span className="eyebrow">Salvamento</span>
            <strong>{saving}</strong>
          </div>
          <div className="mini-progress"><span style={{ width: `${percent}%` }} /></div>
        </section>

        <section className="execution-v2-grid">
          <aside className="execution-v2-current premium-panel">
            <span className="eyebrow">Exercício atual</span>
            <h3>{currentExecution?.position || 1} de {workout.exercises.length}</h3>
            <h2>{currentExercise?.name}</h2>
            <p>{currentSet ? `Série ${currentSet.setNumber} de ${currentExecution.sets.length} • ${currentSet.prescribedReps || currentExercise?.reps || "repetições"}` : "Selecione um exercício"}</p>
            <div className="current-prescription">
              <span>Descanso: {currentExercise?.rest || "60s"}</span>
              <span>Carga sugerida: {currentExercise?.load || "Livre"}</span>
            </div>
            <div className="execution-v2-actions">
              {execution.status === "pausado" ? (
                <button className="metal-button" type="button" onClick={resumeWorkout}><Play size={18} /> Continuar</button>
              ) : (
                <button className="metal-button ghost" type="button" onClick={pauseWorkout} disabled={execution.status !== "em_andamento"}><Pause size={18} /> Pausar</button>
              )}
              <button className="metal-button" type="button" onClick={() => startSet()} disabled={!currentSet || currentSet.status !== "pendente" || execution.status === "pausado" || execution.rest?.status === "em_andamento"}>
                <Play size={18} /> Iniciar série
              </button>
              <button className="metal-button" type="button" onClick={() => openCompleteSetModal()} disabled={!currentSet || currentSet.status !== "em_andamento"}>
                <CheckCircle2 size={18} /> Concluir série
              </button>
              <button className="metal-button light" type="button" onClick={requestFinish}>Finalizar treino</button>
            </div>
          </aside>

          <section className="execution-v2-list" aria-label="Exercícios do treino">
            <div className="section-heading compact-heading">
              <div>
                <span className="eyebrow">Exercícios</span>
                <h3>{exercises.done} de {exercises.total} concluídos</h3>
              </div>
              <strong>{sets.done}/{sets.total} séries</strong>
            </div>
            {execution.exercises.map((exerciseExecution) => {
              const source = workout.exercises.find((exercise) => exercise.id === exerciseExecution.exerciseId);
              const localSets = setTotals({ exercises: [exerciseExecution] });
              const isCurrent = execution.currentExerciseId === exerciseExecution.exerciseId;
              const complete = exerciseExecution.status === "concluido";
              return (
                <article className={`execution-v2-exercise premium-panel ${isCurrent ? "active" : ""} ${complete ? "collapsed" : ""}`} key={exerciseExecution.exerciseId}>
                  <button className="exercise-title-button" type="button" onClick={() => toggleExercise(exerciseExecution.exerciseId)}>
                    <span className="exercise-check">{complete ? <CheckCircle2 size={22} /> : exerciseExecution.position}</span>
                    <span>
                      <strong>{source?.name}</strong>
                      <small>{complete ? `${localSets.done}/${localSets.total} séries concluídas • Carga máxima: ${maxLoadText(exerciseExecution)}` : `${source?.sets} • ${source?.reps}`}</small>
                    </span>
                    {exerciseExecution.expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>

                  {exerciseExecution.expanded && (
                    <div className="exercise-expanded-content">
                      <p>{source?.explanation || "Execute com controle, postura e amplitude segura."}</p>
                      <div className="current-prescription small">
                        <span>Descanso: {source?.rest || "60s"}</span>
                        <span>Carga sugerida: {source?.load || "Livre"}</span>
                      </div>
                      {source?.videoUrl && (
                        <button className="video-link-button" type="button" onClick={() => setVideoExercise(source)}><Video size={16} /> Ver execução do exercício</button>
                      )}
                      <div className="set-list">
                        {exerciseExecution.sets.map((set) => (
                          <button
                            className={`set-row ${set.status}`}
                            key={set.setNumber}
                            type="button"
                            onClick={() => handleSetClick(exerciseExecution.exerciseId, set.setNumber)}
                          >
                            <span>Série {set.setNumber}</span>
                            <span>{set.completedReps || set.prescribedReps || "-"}</span>
                            <span>{set.usedLoad || set.prescribedLoad || "-"}</span>
                            {set.status === "concluida" ? <CheckCircle2 size={18} /> : <span className="set-dot" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        </section>
      </section>

      {restFinishedNotice && (
        <div className="rest-finished-toast" role="status">
          <strong>Descanso concluído!</strong>
          <span>Vamos para a próxima série.</span>
        </div>
      )}

      {execution.rest && (
        <div className="modal-backdrop rest-overlay" role="dialog" aria-modal="true">
          <article className="rest-card premium-panel">
            <span className="eyebrow">Descanso</span>
            <div className="rest-ring" style={{ "--value": `${execution.rest.status === "concluido" ? 100 : Math.max(0, 100 - (restSeconds / Math.max(1, execution.rest.selectedSeconds)) * 100)}%` }}>
              <strong>{formatTime(restSeconds)}</strong>
              <span>{execution.rest.status === "concluido" ? "Pronto" : "entre séries"}</span>
            </div>
            <p>Descanso recomendado: {execution.rest.prescribedSeconds}s</p>
            <div className="rest-controls">
              <button type="button" onClick={() => adjustRest(-15)}><Minus size={16} /> 15s</button>
              <button type="button" onClick={() => adjustRest(15)}><Plus size={16} /> 15s</button>
            </div>
            <button className="metal-button light" type="button" onClick={skipRest}>{execution.rest.status === "concluido" ? "Iniciar próxima série" : "Pular descanso"}</button>
          </article>
        </div>
      )}

      {setModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <article className="form-modal premium-panel workout-set-modal">
            <button className="icon-button modal-close" type="button" onClick={() => setSetModal(null)} aria-label="Fechar"><X size={18} /></button>
            <span className="eyebrow">Concluir série</span>
            <h3>Registre o que você fez</h3>
            <label>Carga usada</label>
            <input value={setModal.usedLoad} onChange={(event) => setSetModal((prev) => ({ ...prev, usedLoad: event.target.value }))} placeholder="Ex: 22,5 kg ou peso corporal" />
            <label>Repetições realizadas</label>
            <input value={setModal.completedReps} onChange={(event) => setSetModal((prev) => ({ ...prev, completedReps: event.target.value }))} placeholder="Ex: 12" />
            <label>Observação opcional</label>
            <textarea value={setModal.observation} onChange={(event) => setSetModal((prev) => ({ ...prev, observation: event.target.value }))} placeholder="Como foi a série?" />
            <button className="metal-button light" type="button" onClick={completeSet}>Salvar e concluir série</button>
          </article>
        </div>
      )}

      {confirmIncomplete && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <article className="form-modal premium-panel">
            <h3>Treino incompleto</h3>
            <p>Você ainda possui exercícios ou séries pendentes. Deseja realmente encerrar o treino como incompleto?</p>
            <div className="modal-actions">
              <button className="metal-button ghost" type="button" onClick={() => setConfirmIncomplete(false)}>Continuar treino</button>
              <button className="metal-button light" type="button" onClick={openIncompleteFeedback}>Encerrar como incompleto</button>
            </div>
          </article>
        </div>
      )}

      {finishOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <article className="form-modal premium-panel workout-feedback-modal">
            <button className="icon-button modal-close" type="button" onClick={() => setFinishOpen(false)} aria-label="Fechar"><X size={18} /></button>
            <span className="eyebrow">Feedback final</span>
            <h3>Como foi seu treino hoje?</h3>
            <label>Como você se sentiu?</label>
            <select value={feedback.feeling} onChange={(event) => setFeedback((prev) => ({ ...prev, feeling: event.target.value }))}>
              {(["Muito bem", "Bem", "Cansado", "Com dor", "Desmotivado"]).map((option) => <option key={option}>{option}</option>)}
            </select>
            <label>Dificuldade</label>
            <select value={feedback.difficulty} onChange={(event) => setFeedback((prev) => ({ ...prev, difficulty: event.target.value }))}>
              {(["Fácil", "Moderado", "Difícil", "Muito difícil"]).map((option) => <option key={option}>{option}</option>)}
            </select>
            <label>Nota</label>
            <div className="rating-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" className={feedback.rating >= star ? "active" : ""} onClick={() => setFeedback((prev) => ({ ...prev, rating: star }))}><Star size={20} /></button>
              ))}
            </div>
            <label>Sentiu dor ou desconforto?</label>
            <select value={feedback.hadPain} onChange={(event) => setFeedback((prev) => ({ ...prev, hadPain: event.target.value }))}>
              <option>Não</option>
              <option>Sim</option>
            </select>
            {feedback.hadPain === "Sim" && (
              <div className="form-grid compact">
                <input value={feedback.painArea} onChange={(event) => setFeedback((prev) => ({ ...prev, painArea: event.target.value }))} placeholder="Região do corpo" />
                <input value={feedback.painIntensity} onChange={(event) => setFeedback((prev) => ({ ...prev, painIntensity: event.target.value }))} placeholder="Intensidade 0 a 10" />
              </div>
            )}
            <textarea value={feedback.observation} onChange={(event) => setFeedback((prev) => ({ ...prev, observation: event.target.value }))} placeholder="Observações opcionais" />
            <button className="metal-button light" type="button" onClick={submitFinish}>Enviar feedback</button>
          </article>
        </div>
      )}

      {videoExercise && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <article className="form-modal premium-panel video-modal">
            <button className="icon-button modal-close" type="button" onClick={() => setVideoExercise(null)} aria-label="Fechar"><X size={18} /></button>
            <span className="eyebrow">Execução</span>
            <h3>{videoExercise.name}</h3>
            {toYoutubeEmbedUrl(videoExercise.videoUrl).includes("youtube") ? (
              <iframe src={toYoutubeEmbedUrl(videoExercise.videoUrl)} title={videoExercise.name} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            ) : null}
            <a className="metal-button light" href={toYoutubeWatchUrl(videoExercise.videoUrl)} target="_blank" rel="noreferrer">Abrir no YouTube</a>
          </article>
        </div>
      )}
    </main>
  );
}
