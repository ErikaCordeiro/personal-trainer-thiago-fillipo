import test from "node:test";
import assert from "node:assert/strict";
import { calculateCurrentWorkoutStreak, clearDemoActivityDataOnce } from "../src/utils/activityData.js";

function record(dateKey) {
  return { dateKey, status: "concluido", exercisesTotal: 1, exercisesDone: 1 };
}

test("current workout count uses the current Monday-Sunday week", () => {
  const history = [record("2026-08-31"), record("2026-09-01"), record("2026-08-30")];
  assert.equal(calculateCurrentWorkoutStreak(history, new Date(2026, 8, 1)), 2);
});

test("demo cleanup preserves workout execution and history", () => {
  const values = new Map([
    ["ptf_workout_execution_v2:student:test", "saved execution"],
    ["ptf_workout_history_v2", "saved history"],
    ["ptf_calendar_demo_events", "demo"]
  ]);
  global.window = {
    localStorage: {
      getItem: (key) => values.get(key) || null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key)
    }
  };

  clearDemoActivityDataOnce();

  assert.equal(values.get("ptf_workout_execution_v2:student:test"), "saved execution");
  assert.equal(values.get("ptf_workout_history_v2"), "saved history");
  assert.equal(values.has("ptf_calendar_demo_events"), false);
  delete global.window;
});
