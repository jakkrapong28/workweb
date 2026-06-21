import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";
import { THAI_COMMENT_REGEX } from "@/lib/validation";

export const COMMENT_STATUS = ["pending", "approved", "rejected"] as const;
export type CommentStatus = (typeof COMMENT_STATUS)[number];

/**
 * Comments live in their own collection (not embedded) because they grow
 * unbounded and must be queried independently by status — e.g. the admin lists
 * every "pending" comment across blogs, and the public page reads only
 * "approved" ones for a single blog.
 */
const CommentSchema = new Schema(
  {
    blogId: {
      type: Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
      index: true,
    },
    authorName: { type: String, required: true, trim: true, maxlength: 100 },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
      // Thai characters and/or digits (and spaces) only — defence in depth on
      // top of the API-layer zod validation.
      match: [
        THAI_COMMENT_REGEX,
        "Comment must contain only Thai characters and/or numbers.",
      ],
    },
    // Enum (not a boolean) so a previously approved comment can be moved back to
    // "rejected" — required by the spec.
    status: {
      type: String,
      enum: COMMENT_STATUS,
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

export type CommentDoc = InferSchemaType<typeof CommentSchema>;

export const Comment = models.Comment || model("Comment", CommentSchema);
export default Comment as mongoose.Model<CommentDoc>;
