import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import { badRequest, notFound, requireAdmin } from "@/lib/api";

/** Admin: publish / unpublish a blog. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return badRequest("id ไม่ถูกต้อง");

  const body = await req.json().catch(() => null);
  if (typeof body?.published !== "boolean") {
    return badRequest("published ต้องเป็น boolean");
  }

  await dbConnect();
  const updated = await Blog.findByIdAndUpdate(
    id,
    { published: body.published },
    { returnDocument: "after" }
  ).lean();
  if (!updated) return notFound("ไม่พบ Blog");

  return NextResponse.json({ ok: true, published: updated.published });
}
