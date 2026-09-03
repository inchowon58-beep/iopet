"use client";

import { useState } from "react";
import Image from "next/image";

function coverFallback(src: string): string {
  return src.replace(/\/\d{2}\.webp(\?.*)?$/i, "/01.webp");
}

export default function BreedPhoto({
  src,
  alt,
  priority = false,
  sizes = "100vw",
  className = "",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const fallback = coverFallback(src);
  const [current, setCurrent] = useState(src);

  return (
    <Image
      src={current}
      alt={alt}
      fill
      unoptimized
      priority={priority}
      sizes={sizes}
      className={`bl-photo ${className}`.trim()}
      onError={() => {
        if (current !== fallback) setCurrent(fallback);
      }}
    />
  );
}
