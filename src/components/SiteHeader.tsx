import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/manu.jpeg"
            alt="Manchester United Logo"
            className="h-8 w-8 object-contain"
          />
          <span>Manchester United</span>
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
