import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const apiSource = readFileSync(new URL("../src/services/api.js", import.meta.url), "utf8");
const appSource = readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");

test("required owner password flow uses the restricted endpoint", () => {
  assert.match(apiSource, /\/auth\/change-required-password/);
  assert.match(apiSource, /new_password/);
  assert.match(apiSource, /confirm_password/);
});

test("owner with pending password change is routed before the dashboard", () => {
  assert.match(appSource, /session\.role === "owner" && session\.must_change_password/);
  assert.match(appSource, /\/fitland\/change-password/);
  assert.match(appSource, /RequiredPasswordChange/);
});
