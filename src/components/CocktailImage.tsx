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
    <div className={`relative overflow-hidden bg-[var(--background-elevated)] ${className}`}>
      <Image
        src={src}
        alt={`${name} cocktail`}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover transition duration-700 ease-out motion-safe:group-hover:scale-[1.03]"
        onError={() => setFailed(true)}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050506]/90 via-[#050506]/20 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#050506]/30" />
    </div>
  );
}
