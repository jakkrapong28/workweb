import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SearchBar from "@/components/SearchBar";
import Pagination from "@/components/Pagination";
import EmptyState from "@/components/EmptyState";
import { getPublishedBlogs } from "@/lib/blogs";
import { formatThaiDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const search = sp.q ?? "";
  const page = Number(sp.page) || 1;

  const { items, total, page: current, totalPages } = await getPublishedBlogs(
    search,
    page
  );

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">บทความทั้งหมด</h1>

        <div className="mb-6">
          <SearchBar initial={search} />
        </div>

        {search && (
          <p className="mb-4 text-sm text-gray-500">
            ผลการค้นหา “{search}” — พบ {total} รายการ
          </p>
        )}

        {items.length === 0 ? (
          <EmptyState title="ไม่พบบทความ" />
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {items.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/blog/${b.slug}`}
                  className="block overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-md"
                >
                  <div className="aspect-video w-full bg-gray-100">
                    {b.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={b.coverUrl}
                        alt={b.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-300">
                        ไม่มีรูปปก
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="mb-1 line-clamp-2 font-semibold">{b.title}</h2>
                    <p className="mb-2 line-clamp-2 text-sm text-gray-600">
                      {b.excerpt}
                    </p>
                    <time className="text-xs text-gray-400">
                      {formatThaiDate(b.createdAt)}
                    </time>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <Pagination page={current} totalPages={totalPages} search={search} />
      </main>
    </>
  );
}
