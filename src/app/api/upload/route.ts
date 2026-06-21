import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { badRequest, requireAdmin } from "@/lib/api";
import { put } from "@vercel/blob";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

/** Admin: upload one image.
 * 1. Vercel Blob  — if BLOB_READ_WRITE_TOKEN is set
 * 2. public/uploads — local dev fallback
 */
export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) return badRequest("ไม่พบไฟล์");
  if (!ALLOWED.includes(file.type)) return badRequest("รองรับเฉพาะรูปภาพ");
  if (file.size > MAX_BYTES) return badRequest("ไฟล์ใหญ่เกิน 5MB");

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `${randomUUID()}.${ext}`;

  // Check all possible Vercel Blob token env var names
  const blobToken =
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.VERCEL_BLOB_READ_WRITE_TOKEN;

  // Use Vercel Blob if a token is explicitly configured,
  // or if we are running on Vercel and a Blob Store ID is connected (using OIDC).
  const useVercelBlob =
    !!blobToken ||
    (process.env.VERCEL === "1" && !!process.env.BLOB_STORE_ID);

  // 1. Vercel Blob (when token is available or OIDC is enabled)
  if (useVercelBlob) {
    try {
      const blob = await put(`uploads/${filename}`, file, {
        access: "public",
        ...(blobToken ? { token: blobToken } : {}),
      });
      return NextResponse.json({ ok: true, url: blob.url });
    } catch (err) {
      console.error("Vercel Blob upload failed:", err);
      return NextResponse.json(
        { error: "Blob upload failed: " + String(err) },
        { status: 500 }
      );
    }
  }

  // 2. Local filesystem (dev only)
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), bytes);
    return NextResponse.json({ ok: true, url: `/uploads/${filename}` });
  } catch {
    return NextResponse.json(
      {
        error:
          "ไม่สามารถอัปโหลดได้: กรุณาตั้งค่า BLOB_READ_WRITE_TOKEN ใน Vercel Environment Variables",
      },
      { status: 500 }
    );
  }
}
