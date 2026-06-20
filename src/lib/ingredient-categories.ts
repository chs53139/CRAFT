export type ShopCategory =
  | "whiskey"
  | "gin"
  | "rum"
  | "spirits"
  | "liqueurs"
  | "mixers"
  | "bitters";

export const SHOP_CATEGORIES: {
  id: ShopCategory;
  label: string;
  description: string;
}[] = [
  { id: "whiskey", label: "Whiskey", description: "Bourbon, rye, scotch & more" },
  { id: "gin", label: "Gin", description: "London dry, old tom, navy strength" },
  { id: "rum", label: "Rum", description: "White, dark, aged & overproof" },
  { id: "spirits", label: "Spirits", description: "Vodka, tequila, brandy & more" },
  { id: "liqueurs", label: "Liqueurs", description: "Campari, vermouth, triple sec…" },
  { id: "mixers", label: "Mixers", description: "Juice, syrup, soda & garnish" },
  { id: "bitters", label: "Bitters", description: "Angostura, orange, aromatic" },
];

export function getShopCategory(id: string, name: string): ShopCategory {
  const key = `${id} ${name}`.toLowerCase();

  if (key.includes("bitters")) return "bitters";
  if (
    key.includes("whiskey") ||
    key.includes("whisky") ||
    key.includes("bourbon") ||
    key.includes("rye") ||
    key.includes("scotch")
  ) {
    return "whiskey";
  }
  if (key.includes("gin")) return "gin";
  if (key.includes("rum")) return "rum";
  if (
    key.includes("vodka") ||
    key.includes("tequila") ||
    key.includes("mezcal") ||
    key.includes("brandy") ||
    key.includes("cognac") ||
    key.includes("pisco") ||
    key.includes("cachaça") ||
    key.includes("cachaca")
  ) {
    return "spirits";
  }
  if (
    key.includes("liqueur") ||
    key.includes("vermouth") ||
    key.includes("campari") ||
    key.includes("aperol") ||
    key.includes("chartreuse") ||
    key.includes("cointreau") ||
    key.includes("triple sec") ||
    key.includes("maraschino") ||
    key.includes("benedictine") ||
    key.includes("absinthe") ||
    key.includes("amaretto") ||
    key.includes("kahlua") ||
    key.includes("sherry") ||
    key.includes("port")
  ) {
    return "liqueurs";
  }
  if (
    key.includes("wine") ||
    key.includes("prosecco") ||
    key.includes("champagne")
  ) {
    return "mixers";
  }

  return "mixers";
}
