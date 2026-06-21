import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import { blogSchema } from "@/lib/validation";
import { badRequest, requireAdmin } from "@/lib/api";

/** Admin: list all blogs (published + drafts) for the dashboard. */
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  await dbConnect();
  const docs = await Blog.find().sort({ createdAt: -1 }).lean();
  const items = docs.map((b) => ({
    id: String(b._id),
    title: b.title,
    slug: b.slug,
    published: b.published,
    viewCount: b.viewCount ?? 0,
    imageCount: b.images?.length ?? 0,
    createdAt: (b.createdAt as Date).toISOString(),
  }));
  return NextResponse.json({ items });
}

/** Admin: create a blog. */
export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = blogSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("ข้อมูลไม่ถูกต้อง", parsed.error.flatten().fieldErrors);
  }

  await dbConnect();
  try {
    const created = await Blog.create(parsed.data);
    return NextResponse.json({ ok: true, id: String(created._id) }, { status: 201 });
  } catch (e) {
    if (isDuplicateKey(e)) return badRequest("slug นี้ถูกใช้แล้ว");
    throw e;
  }
}

export function isDuplicateKey(e: unknown): boolean {
  return Boolean(e && typeof e === "object" && (e as { code?: number }).code === 11000);
}
