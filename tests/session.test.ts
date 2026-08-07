import assert from "node:assert/strict";
import test from "node:test";
import { createSessionToken, verifySessionToken } from "../src/lib/session";

test("session tokens round-trip required claims", async () => {
  process.env.JWT_SECRET = "test-secret-that-is-at-least-32-characters-long";
  const token = await createSessionToken({ sub: "admin-id", username: "admin" });
  const payload = await verifySessionToken(token);

  assert.deepEqual(payload, { sub: "admin-id", username: "admin" });
});

test("session verification rejects a token signed with another secret", async () => {
  process.env.JWT_SECRET = "first-secret-that-is-at-least-32-characters-long";
  const token = await createSessionToken({ sub: "admin-id", username: "admin" });
  process.env.JWT_SECRET = "other-secret-that-is-at-least-32-characters-long";

  assert.equal(await verifySessionToken(token), null);
});
