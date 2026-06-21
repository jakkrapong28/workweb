import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";

/**
 * Images are embedded in the blog: they are always read together with the blog,
 * never queried on their own, and are capped at 7 (1 cover + up to 6 extra).
 * Embedding avoids a join and lets the detail page load in a single read.
 */
const ImageSchema = new Schema(
  {
    url: { type: String, required: true },
    isCover: { type: Boolean, default: false },
  },
  { _id: false }
);

const BlogSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    published: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    images: {
      type: [ImageSchema],
      default: [],
      validate: {
        validator: (v: unknown[]) => v.length <= 7,
        message: "A blog can have at most 7 images (1 cover + 6 extra).",
      },
    },
  },
  { timestamps: true } // createdAt = posted date, updatedAt
);

// Text index to support title search on the public list page.
BlogSchema.index({ title: "text" });

export type BlogDoc = InferSchemaType<typeof BlogSchema>;

export const Blog = models.Blog || model("Blog", BlogSchema);
export default Blog as mongoose.Model<BlogDoc>;
