"use client";

import { COLLECTION_LABELS } from "@/lib/cocktail-curation";
import { CocktailCollection } from "@/lib/types";

const COLLECTIONS: Array<{ id: "all" | CocktailCollection; label: string }> = [
  { id: "all", label: "All" },
  { id: "modern-classic", label: COLLECTION_LABELS["modern-classic"] },
  { id: "tiki", label: COLLECTION_LABELS.tiki },
  { id: "historical", label: COLLECTION_LABELS.historical },
  { id: "rare", label: COLLECTION_LABELS.rare },
  { id: "experimental", label: COLLECTION_LABELS.experimental },
  { id: "bartender-favorite", label: "Bartender picks" },
];

type Props = {
  value: "all" | CocktailCollection;
  onChange: (value: "all" | CocktailCollection) => void;
};

export function CollectionFilter({ value, onChange }: Props) {
  return (
    <div className="collection-filter">
      {COLLECTIONS.map((collection) => (
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
