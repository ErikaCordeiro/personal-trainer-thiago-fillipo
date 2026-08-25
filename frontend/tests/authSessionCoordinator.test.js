import test from "node:test";
import assert from "node:assert/strict";
import { createAuthSessionCoordinator } from "../src/utils/authSessionCoordinator.js";

test("a stale refresh cannot overwrite a newer login", async () => {
  const coordinator = createAuthSessionCoordinator();
  let releaseRefresh;
  let appliedToken = null;
  const refresh = coordinator.runRefresh(
    () => new Promise((resolve) => { releaseRefresh = resolve; }),
    ({ token }) => { appliedToken = token; },
  );

  await Promise.resolve();
  coordinator.beginAuthentication();
  appliedToken = "owner-login-token";
  releaseRefresh({ token: "stale-refresh-token" });
  await refresh;

  assert.equal(appliedToken, "owner-login-token");
});

test("concurrent refresh calls share one request", async () => {
  const coordinator = createAuthSessionCoordinator();
  let calls = 0;
  const factory = async () => ({ token: `token-${++calls}` });
  const first = coordinator.runRefresh(factory, () => {});
  const second = coordinator.runRefresh(factory, () => {});
  assert.equal(first, second);
  await first;
  assert.equal(calls, 1);
});
