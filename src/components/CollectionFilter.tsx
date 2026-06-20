"use client";

import { COLLECTION_LABELS } from "@/lib/cocktail-curation";
import { CocktailCollection } from "@/lib/types";

const COLLECTIONS: Array<{ id: "all" | CocktailCollection; label: string }> = [
  { id: "all", label: "All" },
  { id: "verified-classic", label: "Classics" },
  { id: "hidden-gem", label: "Hidden Gems" },
  { id: "historical", label: "Historical" },
  { id: "tiki", label: "Tiki" },
  { id: "experimental", label: "Avant-garde" },
  { id: "craft-original", label: "CRAFT" },
  { id: "mocktail", label: "Mocktails" },
];

type Props = {
  value: "all" | CocktailCollection;
  onChange: (value: "all" | CocktailCollection) => void;
  hideMocktails?: boolean;
};

export function CollectionFilter({ value, onChange, hideMocktails }: Props) {
  const collections = hideMocktails
    ? COLLECTIONS.filter((collection) => collection.id !== "mocktail")
    : COLLECTIONS;

  return (
    <div className="collection-filter">
      {collections.map((collection) => (
        <button
          key={collection.id}
          type="button"
          className={`collection-filter-chip ${value === collection.id ? "collection-filter-chip-active" : ""}`}
          onClick={() => onChange(collection.id)}
        >
          {collection.label}
        </button>
      ))}
    </div>
  );
}

export function getCollectionLabel(id: CocktailCollection) {
  return COLLECTION_LABELS[id];
}
