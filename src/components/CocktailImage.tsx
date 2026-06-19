"use client";

import Image from "next/image";
import { useState } from "react";
import { COCKTAIL_PLACEHOLDER, getCocktailImageUrl } from "@/lib/cocktail-images";

type Props = {
  slug: string;
  name: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
};

export function CocktailImage({
  slug,
  name,
  priority = false,
  className = "",
  sizes = "(max-width: 768px) 100vw, 400px",
}: Props) {
  const [failed, setFailed] = useState(false);
  const src = failed ? COCKTAIL_PLACEHOLDER : getCocktailImageUrl(slug);

  return (
    <div className={`relative overflow-hidden bg-[var(--card)] ${className}`}>
      <Image
        src={src}
        alt={`${name} cocktail`}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover transition duration-500 group-hover:scale-105"
        onError={() => setFailed(true)}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#070708]/80 via-[#070708]/10 to-transparent" />
    </div>
  );
}
