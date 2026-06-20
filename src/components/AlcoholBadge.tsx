import { isAlcoholic, isMocktail } from "@/lib/drink-type";
import { Cocktail } from "@/lib/types";

type Props = {
  cocktail: Pick<Cocktail, "drinkType">;
  compact?: boolean;
};

export function AlcoholBadge({ cocktail, compact }: Props) {
  const mocktail = isMocktail(cocktail);
  const label = mocktail ? "Non-Alcoholic" : "Alcoholic";

  return (
    <span
      className={`alcohol-badge ${mocktail ? "alcohol-badge-na" : "alcohol-badge-abv"} ${
        compact ? "alcohol-badge-compact" : ""
      }`}
    >
      {label}
    </span>
  );
}

export function AlcoholBadgeFromType({
  drinkType,
  compact,
}: {
  drinkType: Cocktail["drinkType"];
  compact?: boolean;
}) {
  return (
    <AlcoholBadge cocktail={{ drinkType }} compact={compact} />
  );
}

export function getAlcoholLabel(cocktail: Pick<Cocktail, "drinkType">): string {
  return isAlcoholic(cocktail) ? "Alcoholic" : "Non-Alcoholic";
}
