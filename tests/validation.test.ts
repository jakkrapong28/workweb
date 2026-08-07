import assert from "node:assert/strict";
import test from "node:test";
import { commentSchema, slugify } from "../src/lib/validation";
import { normalizePage } from "../src/lib/blogs";

test("comment validation accepts Thai text and numbers", () => {
  const result = commentSchema.safeParse({
    authorName: "ผู้ทดสอบ",
    message: "เนื้อหาดีมาก 123",
  });
  assert.equal(result.success, true);
});

test("comment validation rejects Latin text", () => {
  const result = commentSchema.safeParse({
    authorName: "ผู้ทดสอบ",
    message: "great post",
  });
  assert.equal(result.success, false);
});

test("slugify creates stable ASCII slugs", () => {
  assert.equal(slugify("  Hello, Next.js World!  "), "hello-nextjs-world");
});

test("pagination normalizes invalid input", () => {
  assert.equal(normalizePage(Number.POSITIVE_INFINITY), 1);
  assert.equal(normalizePage(-10), 1);
  assert.equal(normalizePage(2.9), 2);
});
