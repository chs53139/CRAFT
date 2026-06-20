import { COLLECTION_LABELS } from "@/lib/cocktail-curation";
import { CocktailCollection } from "@/lib/types";

type Props = {
  collections: CocktailCollection[];
  limit?: number;
};

export function CollectionTags({ collections, limit = 3 }: Props) {
  if (collections.length === 0) return null;

  const shown = collections.slice(0, limit);

  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((collection) => (
        <span key={collection} className="collection-tag">
          {COLLECTION_LABELS[collection] ?? collection}
        </span>
      ))}
    </div>
  );
}
