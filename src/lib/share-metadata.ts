import type { Metadata } from "next";
import { CRAFT_DESCRIPTION, CRAFT_TAGLINE } from "@/lib/brand";
import { getCocktailImageUrl } from "@/lib/cocktail-images";
import { Cocktail } from "@/lib/types";
import { SharedInventionPayload } from "@/lib/invention-share";

function formatFlavorProfile(flavors: string[]): string {
  if (flavors.length === 0) return CRAFT_TAGLINE;
  return flavors
    .slice(0, 4)
    .map((tag) => tag.replace(/-/g, " "))
    .join(" · ");
}

function cocktailKindLabel(cocktail: Cocktail): string {
  if (cocktail.drinkType === "mocktail") return "Mocktail";
  if (cocktail.collections.includes("hidden-gem")) return "Hidden gem";
  return "Cocktail";
}

export function buildCocktailShareMetadata(cocktail: Cocktail): Metadata {
  const kind = cocktailKindLabel(cocktail);
  const flavorLine = formatFlavorProfile(cocktail.flavorProfile);
  const title = `${cocktail.name} · CRAFT`;
  const description = `${kind} · ${flavorLine}\n${cocktail.description}`;
  const imageUrl = getCocktailImageUrl(cocktail.id);

  return {
    title: cocktail.name,
    description: cocktail.description,
    openGraph: {
      type: "website",
      siteName: "CRAFT",
      title,
      description,
      url: `/cocktails/${cocktail.id}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1200,
          alt: `${cocktail.name} — CRAFT ${kind.toLowerCase()}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: `${kind} · ${flavorLine}`,
      images: [imageUrl],
    },
  };
}

export function buildInventionShareMetadata(invention: SharedInventionPayload): Metadata {
  const flavorLine = formatFlavorProfile(invention.flavorProfile);
  const title = `${invention.name} · CRAFT Original`;
  const description = `AI creation · ${flavorLine}\n${invention.tagline}`;

  return {
    title: invention.name,
    description: invention.tagline,
    openGraph: {
      type: "website",
      siteName: "CRAFT",
      title,
      description,
      images: [
        {
          url: "/icons/icon-512.png",
          width: 512,
          height: 512,
          alt: "CRAFT — Cocktails, perfected.",
        },
      ],
    },
    twitter: {
      card: "summary",
      title,
      description: `AI creation · ${flavorLine}`,
      images: ["/icons/icon-512.png"],
    },
  };
}

export function buildDefaultCraftOpenGraph(): Metadata["openGraph"] {
  return {
    type: "website",
    siteName: "CRAFT",
    title: "CRAFT",
    description: CRAFT_DESCRIPTION,
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "CRAFT — Cocktails, perfected.",
      },
    ],
  };
}
