"use client";

import { useState } from "react";
import { THAI_COMMENT_REGEX } from "@/lib/validation";

export default function CommentForm({ blogId }: { blogId: string }) {
  const [authorName, setAuthorName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Client-side mirror of the server rule (UX only; server is source of truth).
  const messageInvalid = message.length > 0 && !THAI_COMMENT_REGEX.test(message);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!authorName.trim()) return setError("กรุณากรอกชื่อผู้ส่ง");
    if (!message.trim()) return setError("กรุณากรอกข้อความ");
    if (messageInvalid)
      return setError("ความคิดเห็นต้องเป็นภาษาไทยและ/หรือตัวเลขเท่านั้น");

    setSubmitting(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blogId, authorName, message }),
    });
    setSubmitting(false);

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "ส่งไม่สำเร็จ");
      return;
    }
    setDone(true);
    setAuthorName("");
    setMessage("");
  }

  if (done) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        ✅ ส่งความคิดเห็นแล้ว — จะแสดงหลังผู้ดูแลอนุมัติ
        <button
          className="ml-2 underline"
          onClick={() => setDone(false)}
        >
          เขียนอีกครั้ง
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium">ชื่อผู้ส่ง</label>
        <input
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-gray-900"
          placeholder="ชื่อของคุณ"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">ความคิดเห็น</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className={`w-full rounded-md border px-3 py-2 outline-none focus:border-gray-900 ${
            messageInvalid ? "border-red-400" : "border-gray-300"
          }`}
          placeholder="ความคิดเห็น"
        />
        {messageInvalid && (
          <p className="mt-1 text-xs text-red-600">
            ใช้ได้เฉพาะภาษาไทยและ/หรือตัวเลข
          </p>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting || messageInvalid}
        className="rounded-md bg-gray-900 px-5 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {submitting ? "กำลังส่ง..." : "ส่งความคิดเห็น"}
      </button>
    </form>
  );
}
