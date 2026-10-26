/* eslint-disable @next/next/no-img-element */
import PartIcon from "./PartIcon";

// Фото запчасти или красивая заглушка, если фото ещё нет
export default function PartVisual({
  src,
  slug,
  alt,
}: {
  src?: string | null;
  slug: string;
  alt: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-2 to-surface">
      <PartIcon
        slug={slug}
        className="h-1/2 w-1/2 text-line transition duration-500 group-hover:rotate-6 group-hover:scale-110 group-hover:text-accent"
      />
    </div>
  );
}
