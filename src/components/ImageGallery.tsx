"use client";

import { useState } from "react";

interface Img {
  url: string;
  isCover: boolean;
}

/** Cover image + thumbnail strip; click a thumb to make it the main view. */
export default function ImageGallery({ images }: { images: Img[] }) {
  const ordered = [...images].sort(
    (a, b) => Number(b.isCover) - Number(a.isCover)
  );
  const [active, setActive] = useState(0);

  if (ordered.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ordered[active].url}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
      {ordered.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {ordered.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-16 w-24 flex-shrink-0 overflow-hidden rounded border-2 ${
                i === active ? "border-gray-900" : "border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
