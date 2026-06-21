"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Title search box — submits to "/" with ?q=... */
export default function SearchBar({ initial }: { initial: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/?q=${encodeURIComponent(q)}` : "/");
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="ค้นหาจากชื่อ Blog..."
        className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 outline-none focus:border-gray-900"
      />
      <button
        type="submit"
        className="rounded-md bg-gray-900 px-5 py-2 text-white hover:bg-gray-700"
      >
        ค้นหา
      </button>
    </form>
  );
}
