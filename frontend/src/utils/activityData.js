export const WORKOUT_HISTORY_KEY = "ptf_workout_history_v2";
export const WORKOUT_EXECUTION_PREFIX = "ptf_workout_execution_v2";
export const BEST_STREAK_KEY = "ptf_best_workout_streak";
export const CALENDAR_EVENTS_KEY = "ptf_calendar_events_v1";
export const MONTHLY_GOAL_KEY = "ptf_monthly_workout_goal";
export const ACTIVITY_RESET_KEY = "ptf_real_activity_reset_2026_07_24_v1";

export function safeJsonParse(value, fallback = []) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function toLocalDateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateBR(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

export function formatMonthYear(value) {
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(value);
}

export function isWorkoutCompleted(record) {
  if (!record) return false;
  const status = String(record.status || "").toLowerCase();
  if (status !== "concluido" && status !== "completed") return false;
  const total = Number(record.exercisesTotal || record.totalExercises || 0);
  const done = Number(record.exercisesDone || record.completedExercises || 0);
  return total > 0 ? done >= total : true;
}

export function loadWorkoutHistory() {
  if (typeof window === "undefined") return [];
  const records = safeJsonParse(window.localStorage.getItem(WORKOUT_HISTORY_KEY), []);
  return records
    .filter(isWorkoutCompleted)
    .map((record) => {
      const sourceDate = record.finishedAt || record.completedAt || record.date;
      const dateKey = toLocalDateKey(sourceDate);
      return {
        ...record,
        dateKey,
        displayDate: record.displayDate || formatDateBR(sourceDate),
        completedAt: record.completedAt || record.finishedAt || record.date
      };
    })
    .filter((record) => record.dateKey)
    .sort((a, b) => new Date(b.completedAt || b.date) - new Date(a.completedAt || a.date));
}

export function loadCalendarEvents() {
  if (typeof window === "undefined") return [];
  return safeJsonParse(window.localStorage.getItem(CALENDAR_EVENTS_KEY), [])
    .map((event) => ({ ...event, dateKey: event.dateKey || toLocalDateKey(event.date) }))
    .filter((event) => event.dateKey);
}

export function saveCalendarEvent(event) {
  if (typeof window === "undefined") return;
  const current = loadCalendarEvents();
  const normalized = { ...event, id: event.id || `event-${Date.now()}`, dateKey: event.dateKey || toLocalDateKey(event.date) };
  const withoutDuplicate = current.filter((item) => item.id !== normalized.id);
  window.localStorage.setItem(CALENDAR_EVENTS_KEY, JSON.stringify([normalized, ...withoutDuplicate].slice(0, 80)));
}

export function workoutEventsFromHistory(history = loadWorkoutHistory()) {
  return history.map((record) => ({
    id: `workout-${record.id}`,
    type: "workout",
    dateKey: record.dateKey,
    title: record.workoutName || "Treino concluído",
    detail: `${record.exercisesDone || 0}/${record.exercisesTotal || 0} exercícios concluídos`,
    time: record.durationLabel || "Treino finalizado"
  }));
}

export function completedWorkoutDateSet(history = loadWorkoutHistory()) {
  return new Set(history.map((record) => record.dateKey).filter(Boolean));
}

export function calculateCurrentWorkoutStreak(history = loadWorkoutHistory(), today = new Date()) {
  const dates = completedWorkoutDateSet(history);
  if (!dates.size) return 0;
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let count = 0;
  while (dates.has(toLocalDateKey(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export function calculateBestWorkoutStreak(history = loadWorkoutHistory()) {
  const ordered = [...completedWorkoutDateSet(history)].sort();
  if (!ordered.length) return 0;
  let best = 1;
  let current = 1;
  for (let index = 1; index < ordered.length; index += 1) {
    const previous = new Date(`${ordered[index - 1]}T00:00:00`);
    const currentDate = new Date(`${ordered[index]}T00:00:00`);
    const diffDays = Math.round((currentDate - previous) / 86400000);
    current = diffDays === 1 ? current + 1 : 1;
    best = Math.max(best, current);
  }
  return best;
}

export function completedWorkoutsInMonth(history = loadWorkoutHistory(), date = new Date()) {
  const month = date.getMonth();
  const year = date.getFullYear();
  return history.filter((record) => {
    const itemDate = new Date(`${record.dateKey}T00:00:00`);
    return itemDate.getFullYear() === year && itemDate.getMonth() === month;
  });
}

export function getMonthlyWorkoutGoal() {
  if (typeof window === "undefined") return null;
  const stored = Number(window.localStorage.getItem(MONTHLY_GOAL_KEY));
  return Number.isFinite(stored) && stored > 0 ? stored : null;
}

export function clearDemoActivityDataOnce() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(ACTIVITY_RESET_KEY)) return;
  const removablePrefixes = [WORKOUT_EXECUTION_PREFIX];
  const removableKeys = [
    WORKOUT_HISTORY_KEY,
    BEST_STREAK_KEY,
    "ptf_calendar_demo_events",
    "ptf_checkins",
    "ptf_checkin_history",
    "ptf_diet_logs",
    "ptf_meal_logs",
    "ptf_hydration_logs",
    "ptf_assessment_logs",
    "ptf_progress_demo"
  ];
  removableKeys.forEach((key) => window.localStorage.removeItem(key));
  Object.keys(window.localStorage).forEach((key) => {
    if (removablePrefixes.some((prefix) => key.startsWith(prefix))) {
      window.localStorage.removeItem(key);
    }
  });
  window.localStorage.setItem(ACTIVITY_RESET_KEY, new Date().toISOString());
}
