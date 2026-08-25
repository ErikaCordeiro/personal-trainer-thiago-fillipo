import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");

test("service worker ignores unsupported URL schemes", () => {
  assert.match(source, /\["http:",\s*"https:"\]\.includes\(url\.protocol\)/);
});

test("service worker never caches API or auth requests", () => {
  assert.match(source, /url\.pathname\.startsWith\("\/api\/"\)/);
  assert.match(source, /url\.pathname\.startsWith\("\/auth\/"\)/);
});
