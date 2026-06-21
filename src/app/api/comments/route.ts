import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import Comment from "@/models/Comment";
import Blog from "@/models/Blog";
import { commentSchema } from "@/lib/validation";
import { badRequest, requireAdmin } from "@/lib/api";

/** Public: submit a comment. Stored as "pending" — not shown until approved. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const blogId = body?.blogId;

  if (!mongoose.isValidObjectId(blogId)) {
    return badRequest("blogId ไม่ถูกต้อง");
  }

  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("ข้อมูลไม่ถูกต้อง", parsed.error.flatten().fieldErrors);
  }

  await dbConnect();
  const blog = await Blog.findById(blogId).select("_id").lean();
  if (!blog) return badRequest("ไม่พบ Blog");

  await Comment.create({
    blogId,
    authorName: parsed.data.authorName,
    message: parsed.data.message,
    status: "pending",
  });

  return NextResponse.json(
    { ok: true, message: "ส่งความคิดเห็นแล้ว รอการอนุมัติจากผู้ดูแล" },
    { status: 201 }
  );
}

/** Admin: list comments, optionally filtered by status. */
export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const status = new URL(req.url).searchParams.get("status"); // pending|approved|rejected

  await dbConnect();
  const filter: Record<string, unknown> = {};
  if (status && ["pending", "approved", "rejected"].includes(status)) {
    filter.status = status;
  }

  const docs = await Comment.find(filter)
    .sort({ createdAt: -1 })
    .populate("blogId", "title slug")
    .lean();

  const items = docs.map((c) => ({
    id: String(c._id),
    authorName: c.authorName,
    message: c.message,
    status: c.status,
    createdAt: (c.createdAt as Date).toISOString(),
    blog:
      c.blogId && typeof c.blogId === "object"
        ? {
            id: String((c.blogId as { _id: unknown })._id),
            title: (c.blogId as { title?: string }).title ?? "(ถูกลบแล้ว)",
            slug: (c.blogId as { slug?: string }).slug ?? "",
          }
        : null,
  }));

  return NextResponse.json({ items });
}
