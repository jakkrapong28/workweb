import assert from "node:assert/strict";
import test from "node:test";
import { hasValidImageSignature } from "../src/lib/images";

test("image signature validation accepts matching headers", () => {
  assert.equal(
    hasValidImageSignature(
      Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      "image/png"
    ),
    true
  );
  assert.equal(
    hasValidImageSignature(Uint8Array.from([0xff, 0xd8, 0xff]), "image/jpeg"),
    true
  );
});

test("image signature validation rejects spoofed MIME types", () => {
  const text = new TextEncoder().encode("this is not an image");
  assert.equal(hasValidImageSignature(text, "image/png"), false);
});
