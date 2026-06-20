"use client";

import { COLLECTION_LABELS } from "@/lib/cocktail-curation";
import { CocktailCollection } from "@/lib/types";

const COLLECTIONS: Array<{ id: "all" | CocktailCollection; label: string }> = [
  { id: "all", label: "All" },
  { id: "verified-classic", label: "Classics" },
  { id: "hidden-gem", label: "Hidden Gems" },
  { id: "historical", label: "Historical" },
  { id: "tiki", label: "Tiki" },
  { id: "experimental", label: "Experimental" },
  { id: "craft-original", label: "CRAFT" },
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

export function getCollectionLabel(id: CocktailCollection) {
  return COLLECTION_LABELS[id];
}
