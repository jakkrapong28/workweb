"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { slugify } from "@/lib/validation";

interface Img {
  url: string;
  isCover: boolean;
}

export interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published: boolean;
  images: Img[];
}

interface Props {
  blogId?: string; // present = edit mode
  initial: BlogFormData;
}

const MAX_IMAGES = 7;

export default function BlogForm({ blogId, initial }: Props) {
  const router = useRouter();
  const [data, setData] = useState<BlogFormData>(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(blogId));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof BlogFormData>(key: K, value: BlogFormData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  // Auto-generate slug from title until the admin edits the slug manually.
  function onTitle(title: string) {
    setData((d) => ({
      ...d,
      title,
      slug: slugTouched ? d.slug : slugify(title),
    }));
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);

    const remaining = MAX_IMAGES - data.images.length;
    if (files.length > remaining) {
      setError(`เพิ่มรูปได้อีก ${remaining} รูป (สูงสุด ${MAX_IMAGES} รูป)`);
      return;
    }

    setUploading(true);
    const uploaded: Img[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "อัปโหลดรูปไม่สำเร็จ");
        setUploading(false);
        return;
      }
      uploaded.push({ url: json.url, isCover: false });
    }
    setUploading(false);

    setData((d) => {
      const next = [...d.images, ...uploaded];
      // Make sure exactly one cover exists.
      if (!next.some((i) => i.isCover) && next.length) next[0].isCover = true;
      return { ...d, images: next };
    });
  }

  function setCover(idx: number) {
    setData((d) => ({
      ...d,
      images: d.images.map((img, i) => ({ ...img, isCover: i === idx })),
    }));
  }

  function removeImage(idx: number) {
    setData((d) => {
      const next = d.images.filter((_, i) => i !== idx);
      if (next.length && !next.some((i) => i.isCover)) next[0].isCover = true;
      return { ...d, images: next };
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const res = await fetch(blogId ? `/api/blogs/${blogId}` : "/api/blogs", {
      method: blogId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(
        json.error +
          (json.details ? `: ${JSON.stringify(json.details)}` : "") ||
          "บันทึกไม่สำเร็จ"
      );
      return;
    }
    router.push("/admin/blogs");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <Field label="ชื่อ Blog">
        <input
          value={data.title}
          onChange={(e) => onTitle(e.target.value)}
          className="input"
        />
      </Field>

      <Field label="URL Slug">
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-400">/blog/</span>
          <input
            value={data.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", e.target.value);
            }}
            className="input"
          />
        </div>
      </Field>

      <Field label="เนื้อหาอย่างย่อ">
        <textarea
          value={data.excerpt}
          onChange={(e) => set("excerpt", e.target.value)}
          rows={2}
          className="input"
        />
      </Field>

      <Field label="เนื้อหาเต็ม">
        <textarea
          value={data.content}
          onChange={(e) => set("content", e.target.value)}
          rows={10}
          className="input"
        />
      </Field>

      <Field label={`รูปภาพ (${data.images.length}/${MAX_IMAGES})`}>
        <div className="flex flex-wrap gap-3">
          {data.images.map((img, i) => (
            <div
              key={i}
              className="relative h-24 w-32 overflow-hidden rounded-md border border-gray-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              {img.isCover && (
                <span className="absolute left-1 top-1 rounded bg-yellow-400 px-1 text-[10px] font-bold">
                  ปก
                </span>
              )}
              <div className="absolute bottom-1 right-1 flex gap-1">
                {!img.isCover && (
                  <button
                    type="button"
                    onClick={() => setCover(i)}
                    title="ตั้งเป็นรูปปก"
                    className="rounded bg-white/90 px-1 text-xs"
                  >
                    ⭐
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  title="ลบ"
                  className="rounded bg-white/90 px-1 text-xs text-red-600"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          {data.images.length < MAX_IMAGES && (
            <label className="flex h-24 w-32 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-gray-300 text-sm text-gray-400 hover:bg-gray-50">
              {uploading ? "กำลังอัปโหลด..." : "+ เพิ่มรูป"}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={uploading}
                onChange={(e) => uploadFiles(e.target.files)}
              />
            </label>
          )}
        </div>
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={data.published}
          onChange={(e) => set("published", e.target.checked)}
        />
        เผยแพร่ทันที (Publish)
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-gray-900 px-5 py-2 text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 px-5 py-2 hover:bg-gray-50"
        >
          ยกเลิก
        </button>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid #d1d5db;
          padding: 0.5rem 0.75rem;
          outline: none;
        }
        :global(.input:focus) {
          border-color: #111827;
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
