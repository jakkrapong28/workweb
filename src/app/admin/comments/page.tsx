"use client";

import { useEffect, useState } from "react";
import { formatThaiDate } from "@/lib/format";
import EmptyState from "@/components/EmptyState";

type Status = "pending" | "approved" | "rejected";

interface CommentRow {
  id: string;
  authorName: string;
  message: string;
  status: Status;
  createdAt: string;
  blog: { id: string; title: string; slug: string } | null;
}

const TABS: { key: Status; label: string }[] = [
  { key: "pending", label: "รออนุมัติ" },
  { key: "approved", label: "อนุมัติแล้ว" },
  { key: "rejected", label: "ปฏิเสธ" },
];

export default function AdminCommentsPage() {
  const [tab, setTab] = useState<Status>("pending");
  const [rows, setRows] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  // Bump to force a refetch after a moderation action.
  const [refreshKey, setRefreshKey] = useState(0);

  // Refetch whenever the active tab changes or a moderation action occurs.
  useEffect(() => {
    let active = true;
    (async () => {
      const res = await fetch(`/api/comments?status=${tab}`);
      const data = await res.json();
      if (active) {
        setRows(data.items ?? []);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [tab, refreshKey]);

  function changeTab(next: Status) {
    if (next === tab) return;
    setLoading(true);
    setTab(next);
  }

  async function setStatus(id: string, status: Status) {
    await fetch(`/api/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setRefreshKey((k) => k + 1);
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">จัดการความคิดเห็น</h1>

      <div className="mb-6 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => changeTab(t.key)}
            className={`rounded-md px-4 py-2 text-sm ${
              tab === t.key
                ? "bg-gray-900 text-white"
                : "border border-gray-300 bg-white hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <ul className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-2 h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="mb-3 h-4 w-3/4 animate-pulse rounded bg-gray-100" />
              <div className="h-7 w-40 animate-pulse rounded bg-gray-100" />
            </li>
          ))}
        </ul>
      ) : rows.length === 0 ? (
        <EmptyState title="ไม่มีความคิดเห็น" />
      ) : (
        <ul className="space-y-3">
          {rows.map((c) => (
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
              <p className="mb-2 whitespace-pre-wrap text-gray-700">
                {c.message}
              </p>
              <p className="mb-3 text-xs text-gray-400">
                บทความ: {c.blog?.title ?? "(ถูกลบแล้ว)"}
              </p>
              <div className="flex gap-2">
                {/* approve is hidden when already approved; reject is always
                    available so a previously approved comment can be un-approved */}
                {c.status !== "approved" && (
                  <button
                    onClick={() => setStatus(c.id, "approved")}
                    className="rounded-md bg-green-600 px-3 py-1.5 text-xs text-white hover:bg-green-500"
                  >
                    ✓ อนุมัติ
                  </button>
                )}
                {c.status !== "rejected" && (
                  <button
                    onClick={() => setStatus(c.id, "rejected")}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-xs text-white hover:bg-red-500"
                  >
                    ✕ ปฏิเสธ
                  </button>
                )}
                {c.status !== "pending" && (
                  <button
                    onClick={() => setStatus(c.id, "pending")}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50"
                  >
                    ↺ กลับเป็นรออนุมัติ
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
