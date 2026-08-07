import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-sm text-white"
          >
            W
          </span>
          <span>Workweb Blog</span>
        </Link>
        <Link
          href="/admin/blogs"
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          Admin
        </Link>
      </div>
    </header>
  );
}
