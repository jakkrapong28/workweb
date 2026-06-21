import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/mongodb";
import Comment from "@/models/Comment";
import { COMMENT_STATUS } from "@/models/Comment";
import { badRequest, notFound, requireAdmin } from "@/lib/api";

/**
 * Admin: change a comment's status. Any transition is allowed, including
 * approved → rejected (un-approving a previously approved comment).
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return badRequest("id ไม่ถูกต้อง");

  const body = await req.json().catch(() => null);
  const status = body?.status;
  if (!COMMENT_STATUS.includes(status)) {
    return badRequest("status ต้องเป็น pending | approved | rejected");
  }

  await dbConnect();
  const updated = await Comment.findByIdAndUpdate(
    id,
    { status },
    { returnDocument: "after" }
  ).lean();

  if (!updated) return notFound("ไม่พบ comment");

  return NextResponse.json({ ok: true, status: updated.status });
}
