import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import ImageGallery from "@/components/ImageGallery";
import CommentForm from "@/components/CommentForm";
import {
  getApprovedComments,
  getBlogBySlugAndCountView,
} from "@/lib/blogs";
import { formatThaiDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlogBySlugAndCountView(decodeURIComponent(slug));
  if (!blog) notFound();

  const comments = await getApprovedComments(blog.id);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
          ← กลับหน้ารวม
        </Link>

        <article className="mt-4">
          <h1 className="mb-2 text-3xl font-bold">{blog.title}</h1>
          <div className="mb-6 flex gap-4 text-sm text-gray-500">
            <span>{formatThaiDate(blog.createdAt)}</span>
            <span>👁 {blog.viewCount.toLocaleString()} ครั้ง</span>
          </div>

          <ImageGallery images={blog.images} />

          <div className="prose max-w-none whitespace-pre-wrap leading-relaxed">
            {blog.content}
          </div>
        </article>

        <section className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="mb-4 text-xl font-semibold">
            ความคิดเห็น ({comments.length})
          </h2>

          <div className="mb-8 rounded-lg border border-gray-200 bg-white p-4">
            <CommentForm blogId={blog.id} />
          </div>

          {comments.length === 0 ? (
            <p className="text-sm text-gray-500">ยังไม่มีความคิดเห็น</p>
          ) : (
            <ul className="space-y-4">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className="rounded-lg border border-gray-200 bg-white p-4"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-medium">{c.authorName}</span>
                    <time className="text-xs text-gray-400">
                      {formatThaiDate(c.createdAt)}
                    </time>
                  </div>
                  <p className="whitespace-pre-wrap text-gray-700">{c.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
