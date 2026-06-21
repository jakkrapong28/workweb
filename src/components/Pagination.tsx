import Link from "next/link";

interface Props {
  page: number;
  totalPages: number;
  search: string;
}

/** Pagination that preserves the current search query in the URL. */
export default function Pagination({ page, totalPages, search }: Props) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  };

  return (
    <nav className="mt-8 flex items-center justify-center gap-2 text-sm">
      <PageLink disabled={page <= 1} href={href(page - 1)}>
        ← ก่อนหน้า
      </PageLink>
      <span className="px-3 text-gray-600">
        หน้า {page} / {totalPages}
      </span>
      <PageLink disabled={page >= totalPages} href={href(page + 1)}>
        ถัดไป →
      </PageLink>
    </nav>
  );
}

function PageLink({
  disabled,
  href,
  children,
}: {
  disabled: boolean;
  href: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="cursor-not-allowed rounded-md border border-gray-200 px-3 py-1.5 text-gray-300">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="rounded-md border border-gray-300 bg-white px-3 py-1.5 hover:bg-gray-100"
    >
      {children}
    </Link>
  );
}
