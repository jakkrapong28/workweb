import { dbConnect } from "@/lib/mongodb";
import Blog from "@/models/Blog";
import Comment from "@/models/Comment";

export const PAGE_SIZE = 10;

export interface BlogListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverUrl: string | null;
  createdAt: string;
}

export interface PaginatedBlogs {
  items: BlogListItem[];
  total: number;
  page: number;
  totalPages: number;
}

function coverOf(images: { url: string; isCover?: boolean }[]): string | null {
  if (!images?.length) return null;
  return (images.find((i) => i.isCover) ?? images[0]).url;
}

/** Public blog list: only published blogs, optional title search, paginated. */
export async function getPublishedBlogs(
  search: string,
  page: number
): Promise<PaginatedBlogs> {
  await dbConnect();

  const filter: Record<string, unknown> = { published: true };
  if (search.trim()) {
    // Case-insensitive substring match on title (works for Thai too).
    filter.title = { $regex: escapeRegex(search.trim()), $options: "i" };
  }

  const safePage = Math.max(1, page);
  const [docs, total] = await Promise.all([
    Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    Blog.countDocuments(filter),
  ]);

  return {
    items: docs.map((d) => ({
      id: String(d._id),
      title: d.title,
      slug: d.slug,
      excerpt: d.excerpt,
      coverUrl: coverOf(d.images ?? []),
      createdAt: (d.createdAt as Date).toISOString(),
    })),
    total,
    page: safePage,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export interface BlogDetail {
  id: string;
  title: string;
  slug: string;
  content: string;
  images: { url: string; isCover: boolean }[];
  viewCount: number;
  createdAt: string;
}

/**
 * Fetch a published blog by slug AND atomically increment its view count.
 * Returns null if not found / unpublished.
 */
export async function getBlogBySlugAndCountView(
  slug: string
): Promise<BlogDetail | null> {
  await dbConnect();

  const doc = await Blog.findOneAndUpdate(
    { slug, published: true },
    { $inc: { viewCount: 1 } },
    { returnDocument: "after" }
  ).lean();

  if (!doc) return null;

  return {
    id: String(doc._id),
    title: doc.title,
    slug: doc.slug,
    content: doc.content,
    images: (doc.images ?? []).map((i) => ({
      url: i.url,
      isCover: Boolean(i.isCover),
    })),
    viewCount: doc.viewCount ?? 0,
    createdAt: (doc.createdAt as Date).toISOString(),
  };
}

export interface PublicComment {
  id: string;
  authorName: string;
  message: string;
  createdAt: string;
}

/** Approved comments for a blog, newest first. */
export async function getApprovedComments(
  blogId: string
): Promise<PublicComment[]> {
  await dbConnect();
  const docs = await Comment.find({ blogId, status: "approved" })
    .sort({ createdAt: -1 })
    .lean();
  return docs.map((c) => ({
    id: String(c._id),
    authorName: c.authorName,
    message: c.message,
    createdAt: (c.createdAt as Date).toISOString(),
  }));
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
