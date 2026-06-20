import { cocktails, getIngredientById, matchCocktails } from "@/lib/cocktail-matching";
import { findSubstitution } from "@/lib/mixologist/substitutions";
import {
  MixologistInvention,
  MixologistIngredient,
  StrengthLevel,
  SweetnessLevel,
} from "@/lib/mixologist/types";
import { Cocktail, Ingredient } from "@/lib/types";

function toMixologistIngredients(
  items: Array<{ ingredientId: string; amount: string; substituted?: boolean; originalName?: string }>
): MixologistIngredient[] {
  return items.map((item) => {
    const ing = getIngredientById(item.ingredientId);
    return {
      ingredientId: item.ingredientId,
      name: ing?.name ?? item.ingredientId.replace(/-/g, " "),
      amount: item.amount,
      substituted: item.substituted,
      originalName: item.originalName,
    };
  });
}

function estimateSweetness(ingredientIds: string[]): SweetnessLevel {
  let score = 0;
  for (const id of ingredientIds) {
    if (/simple-syrup|rich-syrup|demerara|agave|honey|grenadine|orgeat|sugar|maple|triple-sec|cointreau|sweet-vermouth|liqueur/.test(id)) {
      score += 1;
    }
    if (/campari|aperol|dry-vermouth|bitters|lime-juice|lemon-juice/.test(id)) score -= 0.5;
  }
  if (score <= 0.5) return "dry";
  if (score <= 2) return "balanced";
  return "sweet";
}

function estimateStrength(ingredientIds: string[], amounts: string[]): StrengthLevel {
  let spiritOz = 0;
  let totalOz = 0;

  ingredientIds.forEach((id, index) => {
    const ing = getIngredientById(id);
    const amount = amounts[index] ?? "1 oz";
    const ozMatch = amount.match(/([\d.]+)\s*oz/);
    const oz = ozMatch ? parseFloat(ozMatch[1]) : 0.5;
    totalOz += oz;
    if (ing?.category === "spirit" || /overproof|151|absinthe|everclear/.test(id)) {
      spiritOz += oz;
    } else if (ing?.category === "liqueur") {
      spiritOz += oz * 0.4;
    }
  });

  if (totalOz === 0) return "medium";
  const ratio = spiritOz / totalOz;
  if (ratio >= 0.55) return "strong";
  if (ratio >= 0.28) return "medium";
  return "low";
}

function cocktailToInvention(
  cocktail: Cocktail,
  source: "existing" | "variation",
  confidence: number,
  basedOn?: string,
  substitutions?: Map<string, { usedId: string; originalName: string }>
): MixologistInvention {
  const ingredients = cocktail.ingredients.map((ci) => {
    const sub = substitutions?.get(ci.ingredientId);
    const usedId = sub?.usedId ?? ci.ingredientId;
    const ing = getIngredientById(usedId);
    return {
      ingredientId: usedId,
      name: ing?.name ?? usedId.replace(/-/g, " "),
      amount: ci.amount,
      substituted: !!sub,
      originalName: sub?.originalName,
    };
  });

  const ids = ingredients.map((i) => i.ingredientId);
  const amounts = ingredients.map((i) => i.amount);

  return {
    source,
    confidence,
    name: cocktail.name,
    tagline:
      source === "existing"
        ? "Already in the CRAFT catalogue — you have everything to make it."
        : `A bar-friendly twist on the classic ${basedOn ?? cocktail.name}.`,
    ingredients,
    instructions: cocktail.instructions,
    flavorProfile: cocktail.flavorProfile,
    sweetness: estimateSweetness(ids),
    strength: estimateStrength(ids, amounts),
    method: cocktail.method,
    glassware: cocktail.glassware,
    cocktailId: cocktail.id,
    basedOn,
    notes:
      source === "variation" && substitutions?.size
        ? `${substitutions.size} ingredient${substitutions.size !== 1 ? "s" : ""} swapped with close substitutes from your shelf.`
        : undefined,
  };
}

export function findExistingCocktail(selectedIds: string[]): MixologistInvention | null {
  if (selectedIds.length === 0) return null;

  const makeable = matchCocktails(selectedIds).filter((m) => m.canMake);
  if (makeable.length === 0) return null;

  const selectedSet = new Set(selectedIds);
  const scored = makeable
    .map((m) => {
      const usedCount = m.cocktail.ingredients.filter((ci) =>
        selectedSet.has(ci.ingredientId)
      ).length;
      const efficiency = usedCount / Math.max(selectedIds.length, 1);
      const interest = m.cocktail.obscurityScore / 100;
      return {
        match: m,
        score: efficiency * 0.55 + interest * 0.25 + (m.cocktail.ingredients.length <= 5 ? 0.2 : 0),
      };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0]?.match;
  if (!best) return null;

  const confidence = Math.min(98, 88 + Math.round(scored[0].score * 10));
  return cocktailToInvention(best.cocktail, "existing", confidence);
}

export function findCocktailVariation(selectedIds: string[]): MixologistInvention | null {
  if (selectedIds.length < 2) return null;

  const available = new Set(selectedIds);
  type Candidate = {
    cocktail: Cocktail;
    substitutions: Map<string, { usedId: string; originalName: string }>;
    subCount: number;
  };

  const candidates: Candidate[] = [];

  for (const cocktail of cocktails) {
    const substitutions = new Map<string, { usedId: string; originalName: string }>();
    let subCount = 0;
    let valid = true;

    for (const ci of cocktail.ingredients) {
      if (available.has(ci.ingredientId)) continue;

      const subId = findSubstitution(ci.ingredientId, available);
      if (!subId) {
        valid = false;
        break;
      }

      const original = getIngredientById(ci.ingredientId);
      substitutions.set(ci.ingredientId, {
        usedId: subId,
        originalName: original?.name ?? ci.ingredientId.replace(/-/g, " "),
      });
      subCount += 1;
    }

    if (!valid) continue;
    if (subCount === 0 || subCount > 2) continue;
    if (cocktail.ingredients.length < 3) continue;

    candidates.push({ cocktail, substitutions, subCount });
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    if (a.subCount !== b.subCount) return a.subCount - b.subCount;
    return b.cocktail.obscurityScore - a.cocktail.obscurityScore;
  });

  const best = candidates[0];
  const confidence = Math.min(92, 78 + (2 - best.subCount) * 7);

  const invention = cocktailToInvention(
    best.cocktail,
    "variation",
    confidence,
    best.cocktail.name,
    best.substitutions
  );

  if (best.subCount > 0) {
    invention.name = `${best.cocktail.name} (Your Bar Cut)`;
  }

  return invention;
}

function spiritLabel(ing: Ingredient): string {
  const name = ing.name.split(" ")[0];
  return name.length > 12 ? name.slice(0, 12) : name;
}

function buildName(spirit: Ingredient, style: string, modifier?: Ingredient): string {
  const base = spiritLabel(spirit);
  if (modifier) {
    return `${base} ${modifier.name.split(" ")[0]} ${style}`.replace(/\s+/g, " ").trim();
  }
  return `${base} ${style}`.trim();
}

export function generateOriginalCocktail(selectedIds: string[]): MixologistInvention | null {
  if (selectedIds.length < 2) return null;

  const available = selectedIds
    .map((id) => getIngredientById(id))
    .filter((ing): ing is Ingredient => !!ing);

  const spirits = available.filter((i) => i.category === "spirit");
  if (spirits.length === 0) return null;

  const spirit = spirits[0];
  const citrus = available.find((i) => /lime-juice|lemon-juice|grapefruit-juice/.test(i.id));
  const sweet = available.find((i) =>
    /simple-syrup|rich-simple|demerara|agave|honey|grenadine|triple-sec|cointreau|orgeat/.test(i.id)
  );
  const bitter = available.find((i) =>
    /bitters|campari|aperol|amaro|fernet|suze/.test(i.id)
  );
  const vermouth = available.find((i) => /vermouth|lillet/.test(i.id));
  const mixer = available.find(
    (i) =>
      i.category === "mixer" ||
      /soda|tonic|ginger-beer|prosecco|champagne|sparkling/.test(i.id)
  );
  const herb = available.find((i) => /mint|basil|rosemary|ginger/.test(i.id));

  type Build = {
    score: number;
    style: string;
    method: string;
    glass: string;
    flavorProfile: string[];
    items: Array<{ ingredientId: string; amount: string }>;
    instructions: string[];
    tagline: string;
  };

  const builds: Build[] = [];

  if (spirit && citrus && sweet) {
    builds.push({
      score: herb ? 92 : 88,
      style: herb ? "Smash" : "Sour",
      method: "Shaken",
      glass: "Coupe",
      flavorProfile: herb
        ? ["citrus", "herbal", "bright"]
        : ["citrus", "balanced", "bright"],
      items: [
        { ingredientId: spirit.id, amount: "2 oz" },
        { ingredientId: citrus.id, amount: "1 oz" },
        { ingredientId: sweet.id, amount: sweet.id.includes("triple-sec") ? "0.75 oz" : "0.5 oz" },
        ...(herb ? [{ ingredientId: herb.id, amount: herb.id.includes("mint") ? "8 leaves" : "3 leaves" }] : []),
      ],
      instructions: herb
        ? [
            `Gently muddle the ${herb.name.toLowerCase()} with the ${sweet.name.toLowerCase()} in a shaker.`,
            `Add ${spirit.name.toLowerCase()} and ${citrus.name.toLowerCase()}, then shake hard with ice.`,
            "Double-strain into a chilled coupe.",
          ]
        : [
            `Add ${spirit.name.toLowerCase()}, ${citrus.name.toLowerCase()}, and ${sweet.name.toLowerCase()} to a shaker with ice.`,
            "Shake hard until well chilled.",
            "Strain into a chilled coupe.",
          ],
      tagline: "Built on the classic sour ratio — spirit, citrus, and sweetness in balance.",
    });
  }

  if (spirit && vermouth && bitter && /bitters/.test(bitter.id)) {
    builds.push({
      score: 85,
      style: "Manhattan",
      method: "Stirred",
      glass: "Coupe",
      flavorProfile: ["spirit-forward", "herbal", "bold"],
      items: [
        { ingredientId: spirit.id, amount: "2 oz" },
        { ingredientId: vermouth.id, amount: "1 oz" },
        { ingredientId: bitter.id, amount: "2 dashes" },
      ],
      instructions: [
        "Add ingredients to a mixing glass with ice.",
        "Stir until chilled, about 30 seconds.",
        "Strain into a chilled coupe and garnish with a cherry or twist.",
      ],
      tagline: "A stirred classic — spirit lengthened with vermouth and aromatic bitters.",
    });
  }

  if (spirit && vermouth && bitter && !/bitters/.test(bitter.id)) {
    builds.push({
      score: 84,
      style: "Negroni",
      method: "Stirred",
      glass: "Rocks",
      flavorProfile: ["bitter", "spirit-forward", "herbal"],
      items: [
        { ingredientId: spirit.id, amount: "1 oz" },
        { ingredientId: vermouth.id, amount: "1 oz" },
        { ingredientId: bitter.id, amount: "1 oz" },
      ],
      instructions: [
        "Add ingredients to a mixing glass with ice.",
        "Stir until cold, then strain over fresh ice in a rocks glass.",
        "Garnish with an orange peel.",
      ],
      tagline: "Equal parts spirit, vermouth, and bitter — the holy trinity of balance.",
    });
  }

  if (spirit && mixer) {
    builds.push({
      score: citrus ? 84 : 80,
      style: "Highball",
      method: "Built",
      glass: "Highball",
      flavorProfile: ["refreshing", "long", "easy-drinking"],
      items: [
        { ingredientId: spirit.id, amount: "2 oz" },
        ...(citrus ? [{ ingredientId: citrus.id, amount: "0.5 oz" }] : []),
        { ingredientId: mixer.id, amount: "4 oz" },
      ],
      instructions: [
        "Fill a highball glass with ice.",
        `Add ${spirit.name.toLowerCase()}${citrus ? ` and ${citrus.name.toLowerCase()}` : ""}.`,
        `Top with ${mixer.name.toLowerCase()} and stir gently once.`,
      ],
      tagline: "Tall, cold, and built for easy sipping.",
    });
  }

  if (spirit && bitter && !vermouth) {
    builds.push({
      score: 78,
      style: "Old Fashioned",
      method: sweet ? "Stirred" : "Built",
      glass: "Rocks",
      flavorProfile: ["spirit-forward", "bold", "bitter"],
      items: [
        { ingredientId: spirit.id, amount: "2 oz" },
        ...(sweet ? [{ ingredientId: sweet.id, amount: "0.25 oz" }] : []),
        { ingredientId: bitter.id, amount: bitter.id.includes("bitters") ? "3 dashes" : "0.5 oz" },
      ],
      instructions: [
        "Add ingredients to a mixing glass with ice.",
        "Stir until chilled, about 20 seconds.",
        "Strain over a large ice cube in a rocks glass.",
      ],
      tagline: "Spirit first, lightly sweetened, with aromatic bitters.",
    });
  }

  if (builds.length === 0) return null;

  builds.sort((a, b) => b.score - a.score);
  const best = builds[0];
  const modifier = bitter && !best.items.some((i) => i.ingredientId === bitter.id) ? bitter : undefined;
  const name = buildName(spirit, best.style, modifier);
  const ingredients = toMixologistIngredients(best.items);
  const ids = ingredients.map((i) => i.ingredientId);
  const amounts = ingredients.map((i) => i.amount);
  const confidence = Math.min(88, 58 + Math.round(best.score * 0.3));

  return {
    source: "original",
    confidence,
    name,
    tagline: best.tagline,
    ingredients,
    instructions: best.instructions,
    flavorProfile: best.flavorProfile,
    sweetness: estimateSweetness(ids),
    strength: estimateStrength(ids, amounts),
    method: best.method,
    glassware: best.glass,
    notes: "Original recipe composed from classic cocktail ratios using only your selected ingredients.",
  };
}

export function inventDrink(selectedIds: string[]): MixologistInvention | null {
  const uniqueIds = [...new Set(selectedIds.filter(Boolean))];
  if (uniqueIds.length < 2) return null;

  return (
    findExistingCocktail(uniqueIds) ??
    findCocktailVariation(uniqueIds) ??
    generateOriginalCocktail(uniqueIds)
  );
}
