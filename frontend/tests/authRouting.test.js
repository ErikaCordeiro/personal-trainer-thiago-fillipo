import test from "node:test";
import assert from "node:assert/strict";
import { getLoginEndpoint, isOwnerLoginPath } from "../src/utils/authRouting.js";

test("Fitland login is always routed to the owner endpoint", () => {
  assert.equal(isOwnerLoginPath("/fitland/login"), true);
  assert.equal(isOwnerLoginPath("/fitland/login/"), true);
  assert.equal(getLoginEndpoint(isOwnerLoginPath("/fitland/login")), "/auth/owner-login");
});

test("personal login uses the regular auth endpoint", () => {
  assert.equal(isOwnerLoginPath("/personal/thiago-fillipo/login"), false);
  assert.equal(getLoginEndpoint(false), "/auth/login");
});
