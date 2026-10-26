"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import PartIcon from "./PartIcon";

// Галерея на странице запчасти: большое фото и миниатюры
export default function Gallery({
  images,
  alt,
  slug,
}: {
  images: string[];
  alt: string;
  slug: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-3xl border bg-surface">
        {current ? (
          <img src={current} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-2 to-surface">
            <PartIcon slug={slug} className="h-1/2 w-1/2 text-line" />
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto">
          {images.map((u, i) => (
            <button
              key={u}
              type="button"
              onClick={() => setActive(i)}
              className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                i === active
                  ? "border-accent"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img src={u} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
