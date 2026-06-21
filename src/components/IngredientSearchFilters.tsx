"use client";

import { getIngredientsByIds } from "@/lib/cocktail-matching";
import { IngredientBucket, IngredientSearchFilters } from "@/lib/ingredient-search";
import { Ingredient } from "@/lib/types";

const BUCKET_LABELS: Record<IngredientBucket, string> = {
  must: "Must include",
  nice: "Nice to have",
  exclude: "Exclude",
};

const BUCKET_HINTS: Record<IngredientBucket, string> = {
  must: "Recipe must contain these",
  nice: "Boost matches when present",
  exclude: "Skip drinks with these",
};

type Props = {
  filters: IngredientSearchFilters;
  activeBucket: IngredientBucket;
  onActiveBucketChange: (bucket: IngredientBucket) => void;
  onRemove: (ingredientId: string) => void;
};

function BucketChip({
  ingredient,
  bucket,
  onRemove,
}: {
  ingredient: Ingredient;
  bucket: IngredientBucket;
  onRemove: (ingredientId: string) => void;
}) {
  return (
    <button
      type="button"
      className={`ingredient-bucket-chip ingredient-bucket-chip-${bucket}`}
      onClick={() => onRemove(ingredient.id)}
      title={`Remove ${ingredient.name}`}
    >
      <span>{ingredient.name}</span>
      <span aria-hidden>×</span>
    </button>
  );
}

function BucketSection({
  bucket,
  ingredientIds,
  onRemove,
}: {
  bucket: IngredientBucket;
  ingredientIds: string[];
  onRemove: (ingredientId: string) => void;
}) {
  const items = getIngredientsByIds(ingredientIds);

  return (
    <div className="ingredient-bucket-section">
      <div className="ingredient-bucket-section-header">
        <p className="ingredient-bucket-section-label">{BUCKET_LABELS[bucket]}</p>
        <p className="ingredient-bucket-section-hint">{BUCKET_HINTS[bucket]}</p>
      </div>
      {items.length === 0 ? (
        <p className="ingredient-bucket-empty">None selected</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((ingredient) => (
            <BucketChip
              key={ingredient.id}
              ingredient={ingredient}
              bucket={bucket}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function IngredientFilterBuckets({
  filters,
  activeBucket,
  onActiveBucketChange,
  onRemove,
}: Props) {
  const buckets: IngredientBucket[] = ["must", "nice", "exclude"];

  return (
    <div className="ingredient-filter-buckets">
      <p className="ingredient-bucket-picker-label">Add ingredients to</p>
      <div className="ingredient-bucket-tabs">
        {buckets.map((bucket) => {
          const count =
            bucket === "must"
              ? filters.mustInclude.length
              : bucket === "nice"
                ? filters.niceToHave.length
                : filters.exclude.length;

          return (
            <button
              key={bucket}
              type="button"
              className={`ingredient-bucket-tab ingredient-bucket-tab-${bucket} ${
                activeBucket === bucket ? "ingredient-bucket-tab-active" : ""
              }`}
              onClick={() => onActiveBucketChange(bucket)}
            >
              {BUCKET_LABELS[bucket]}
              {count > 0 ? <span className="ingredient-bucket-count">{count}</span> : null}
            </button>
          );
        })}
      </div>

      <div className="ingredient-bucket-sections">
        <BucketSection bucket="must" ingredientIds={filters.mustInclude} onRemove={onRemove} />
        <BucketSection bucket="nice" ingredientIds={filters.niceToHave} onRemove={onRemove} />
        <BucketSection bucket="exclude" ingredientIds={filters.exclude} onRemove={onRemove} />
      </div>
    </div>
  );
}

export const INGREDIENT_SORT_OPTIONS = [
  { id: "match", label: "Match %" },
  { id: "popularity", label: "Popularity" },
  { id: "rating", label: "Rating" },
  { id: "rarity", label: "Rarity" },
] as const;

type SortProps = {
  value: "popularity" | "rating" | "rarity" | "match";
  onChange: (value: "popularity" | "rating" | "rarity" | "match") => void;
};

export function IngredientSearchSortFilter({ value, onChange }: SortProps) {
  return (
    <div className="ingredient-search-sort">
      <p className="ingredient-search-sort-label">Sort by</p>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {INGREDIENT_SORT_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`surprise-chip shrink-0 ${value === option.id ? "surprise-chip-active" : ""}`}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
