import { z } from "zod";

/**
 * Comment message rule: Thai characters and/or numbers only.
 *
 *  - ฀-๿  : the entire Thai Unicode block. This already includes Thai
 *                     digits ๐-๙ (U+0E50-U+0E59), so both Thai and Arabic
 *                     numerals are accepted.
 *  - 0-9            : Arabic digits.
 *  - \s             : whitespace, so multi-word comments are possible.
 *
 * Explicitly rejected: Latin letters (a-z), emoji, and punctuation — per the
 * spec ("ภาษาไทยและ/หรือตัวเลขเท่านั้น").
 *
 * Validated in two layers: client-side (UX) and server-side / schema (source of
 * truth) so a direct API call can't bypass it.
 */
export const THAI_COMMENT_REGEX = /^[฀-๿0-9\s]+$/;

export const commentSchema = z.object({
  authorName: z
    .string()
    .trim()
    .min(1, "กรุณากรอกชื่อผู้ส่ง")
    .max(100, "ชื่อยาวเกินไป"),
  message: z
    .string()
    .trim()
    .min(1, "กรุณากรอกข้อความ")
    .max(1000, "ข้อความยาวเกินไป")
    .regex(THAI_COMMENT_REGEX, "ความคิดเห็นต้องเป็นภาษาไทยและ/หรือตัวเลขเท่านั้น"),
});

export type CommentInput = z.infer<typeof commentSchema>;

const imageSchema = z.object({
  url: z.string().min(1),
  isCover: z.boolean().optional().default(false),
});

export const blogSchema = z.object({
  title: z.string().trim().min(1, "กรุณากรอกชื่อ Blog"),
  slug: z
    .string()
    .trim()
    .min(1, "กรุณากรอก slug")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug ต้องเป็น a-z, 0-9 และ - เท่านั้น"),
  excerpt: z.string().trim().min(1, "กรุณากรอกเนื้อหาอย่างย่อ"),
  content: z.string().trim().min(1, "กรุณากรอกเนื้อหา"),
  published: z.boolean().optional().default(false),
  images: z
    .array(imageSchema)
    .max(7, "รูปได้สูงสุด 7 รูป (ปก 1 + เพิ่มเติม 6)")
    .refine((imgs) => imgs.filter((i) => i.isCover).length <= 1, {
      message: "มีรูปปกได้เพียง 1 รูป",
    })
    .optional()
    .default([]),
});

export type BlogInput = z.infer<typeof blogSchema>;

export const loginSchema = z.object({
  username: z.string().trim().min(1, "กรุณากรอก username"),
  password: z.string().min(1, "กรุณากรอก password"),
});

/**
 * Convert a title into a URL-safe ASCII slug.
 *
 * Slugs are intentionally ASCII-only: non-ASCII (e.g. Thai) path segments are
 * brittle in URLs and don't route reliably. For a Thai-only title the stripped
 * result is empty, so we fall back to a short unique id — the admin can then
 * rename it to something meaningful via the edit form.
 */
export function slugify(input: string): string {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return base || `post-${Date.now().toString(36)}`;
}
