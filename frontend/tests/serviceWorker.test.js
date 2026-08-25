import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");

test("service worker ignores unsupported URL schemes", () => {
  assert.match(source, /\["http:",\s*"https:"\]\.includes\(url\.protocol\)/);
});

test("service worker never caches API or auth requests", () => {
  assert.match(source, /request\.method !== "GET"/);
  assert.match(source, /url\.pathname\.startsWith\("\/api\/"\)/);
  assert.match(source, /url\.pathname\.startsWith\("\/auth\/"\)/);
});

test("service worker forces an update and removes old caches", () => {
  assert.match(source, /`\$\{CACHE_PREFIX\}v7`/);
  assert.match(source, /self\.skipWaiting\(\)/);
  assert.match(source, /self\.clients\.claim\(\)/);
  assert.match(source, /caches\.delete\(key\)/);
});
