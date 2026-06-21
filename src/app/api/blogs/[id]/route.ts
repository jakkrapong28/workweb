import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Comment from "@/models/Comment";
import { blogSchema } from "@/lib/validation";
import { badRequest, notFound, requireAdmin } from "@/lib/api";
import { isDuplicateKey } from "../route";

/** Admin: read a single blog (for the edit form). */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return badRequest("id ไม่ถูกต้อง");

  await dbConnect();
  const b = await Blog.findById(id).lean();
  if (!b) return notFound("ไม่พบ Blog");

  return NextResponse.json({
    id: String(b._id),
    title: b.title,
    slug: b.slug,
    excerpt: b.excerpt,
    content: b.content,
    published: b.published,
    viewCount: b.viewCount ?? 0,
    images: (b.images ?? []).map((i) => ({ url: i.url, isCover: Boolean(i.isCover) })),
  });
}

/** Admin: update a blog (title, content, slug, images, published, …). */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return badRequest("id ไม่ถูกต้อง");

  const body = await req.json().catch(() => null);
  const parsed = blogSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("ข้อมูลไม่ถูกต้อง", parsed.error.flatten().fieldErrors);
  }

  await dbConnect();
  try {
    const updated = await Blog.findByIdAndUpdate(id, parsed.data, {
      returnDocument: "after",
      runValidators: true,
    }).lean();
    if (!updated) return notFound("ไม่พบ Blog");
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (isDuplicateKey(e)) return badRequest("slug นี้ถูกใช้แล้ว");
    throw e;
  }
}

/** Admin: delete a blog and its comments. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return badRequest("id ไม่ถูกต้อง");

  await dbConnect();
  const deleted = await Blog.findByIdAndDelete(id).lean();
  if (!deleted) return notFound("ไม่พบ Blog");
  await Comment.deleteMany({ blogId: id });

  return NextResponse.json({ ok: true });
}
