"use client";

import { useMemo } from "react";
import { ShareButton } from "@/components/ShareButton";
import { getCocktailById } from "@/lib/cocktail-matching";
import { buildInventionSharePath } from "@/lib/invention-share";
import { MixologistInvention } from "@/lib/mixologist/types";
import {
  buildCocktailSharePayload,
  buildInventionSharePayload,
} from "@/lib/share";
import { Cocktail } from "@/lib/types";

type CocktailProps = {
  cocktail: Cocktail;
  compact?: boolean;
  className?: string;
};

export function ShareCocktailButton({ cocktail, compact, className }: CocktailProps) {
  const payload = useMemo(() => buildCocktailSharePayload(cocktail), [cocktail]);

  return <ShareButton payload={payload} compact={compact} className={className} />;
}

type InventionProps = {
  invention: MixologistInvention;
  compact?: boolean;
  className?: string;
};

export function ShareInventionButton({ invention, compact, className }: InventionProps) {
  const payload = useMemo(() => {
    if (invention.cocktailId) {
      const cocktail = getCocktailById(invention.cocktailId);
      if (cocktail) return buildCocktailSharePayload(cocktail);
    }

    return buildInventionSharePayload(invention, buildInventionSharePath(invention));
  }, [invention]);

  return <ShareButton payload={payload} compact={compact} className={className} />;
}
