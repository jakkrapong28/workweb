"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BlogForm, { type BlogFormData } from "@/components/BlogForm";

export default function EditBlogPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<BlogFormData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/blogs/${id}`)
      .then((r) => r.json())
      .then((b) => {
        if (b.error) {
          setError(b.error);
          return;
        }
        setData({
          title: b.title,
          slug: b.slug,
          excerpt: b.excerpt,
          content: b.content,
          published: b.published,
          images: b.images,
        });
      });
  }, [id]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return <p className="text-gray-500">กำลังโหลด...</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">แก้ไขบทความ</h1>
      <BlogForm blogId={id} initial={data} />
    </div>
  );
}
