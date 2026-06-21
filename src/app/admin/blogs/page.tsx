"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatThaiDate } from "@/lib/format";
import EmptyState from "@/components/EmptyState";

interface BlogRow {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  viewCount: number;
  imageCount: number;
  createdAt: string;
}

export default function AdminBlogsPage() {
  const [rows, setRows] = useState<BlogRow[]>([]);
  const [loading, setLoading] = useState(true);
  // Bump to force a refetch after a mutation.
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await fetch("/api/blogs");
      const data = await res.json();
      if (active) {
        setRows(data.items ?? []);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const reload = () => setRefreshKey((k) => k + 1);

  async function togglePublish(b: BlogRow) {
    await fetch(`/api/blogs/${b.id}/publish`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !b.published }),
    });
    reload();
  }

  async function remove(b: BlogRow) {
    if (!confirm(`ลบบทความ “${b.title}” ?`)) return;
    await fetch(`/api/blogs/${b.id}`, { method: "DELETE" });
    reload();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">จัดการบทความ</h1>
        <Link
          href="/admin/blogs/new"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
        >
          + สร้างบทความ
        </Link>
      </div>

      {loading ? (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-gray-100 px-4 py-4 last:border-0"
            >
              <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
              <div className="ml-auto h-7 w-44 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState title="ยังไม่มีบทความ" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">ชื่อ / slug</th>
                <th className="px-4 py-3">สถานะ</th>
                <th className="px-4 py-3">วิว</th>
                <th className="px-4 py-3">วันที่</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{b.title}</div>
                    <div className="text-xs text-gray-400">/{b.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        b.published
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {b.published ? "เผยแพร่" : "ฉบับร่าง"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{b.viewCount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {formatThaiDate(b.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => togglePublish(b)}
                        className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
                      >
                        {b.published ? "Unpublish" : "Publish"}
                      </button>
                      <Link
                        href={`/admin/blogs/${b.id}/edit`}
                        className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
                      >
                        แก้ไข
                      </Link>
                      <button
                        onClick={() => remove(b)}
                        className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
