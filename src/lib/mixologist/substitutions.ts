/** Groups of interchangeable ingredients for variation matching */
export const SUBSTITUTION_GROUPS: string[][] = [
  ["lime-juice", "lemon-juice", "grapefruit-juice"],
  [
    "triple-sec",
    "cointreau",
    "orange-curacao",
    "orange-liqueur",
    "grand-marnier",
  ],
  ["simple-syrup", "rich-simple-syrup", "demerara-syrup", "agave-syrup", "honey-syrup"],
  ["bourbon", "rye-whiskey", "rye", "whiskey", "tennessee-whiskey"],
  ["gin", "london-dry-gin", "dry-gin", "plymouth-gin"],
  ["tequila-blanco", "tequila-reposado", "tequila", "mezcal"],
  ["rum-white", "rum-light", "rum", "rum-dark", "rum-aged"],
  ["vodka", "citron-vodka", "vanilla-vodka"],
  ["campari", "aperol", "cappelletti"],
  ["sweet-vermouth", "carpano-antica", "cocchi-vermouth-di-torino"],
  ["dry-vermouth", "dolin-dry", "lillet-blanc"],
  ["club-soda", "soda-water", "sparkling-water"],
  ["ginger-beer", "ginger-ale"],
];

const substitutionMap = new Map<string, Set<string>>();

for (const group of SUBSTITUTION_GROUPS) {
  const set = new Set(group);
  for (const id of group) {
    substitutionMap.set(id, set);
  }
}

export function canSubstitute(requiredId: string, availableId: string): boolean {
  if (requiredId === availableId) return true;
  const group = substitutionMap.get(requiredId);
  return group?.has(availableId) ?? false;
}

export function findSubstitution(
  requiredId: string,
  availableIds: Set<string>
): string | undefined {
  if (availableIds.has(requiredId)) return requiredId;
  const group = substitutionMap.get(requiredId);
  if (!group) return undefined;
  for (const id of group) {
    if (availableIds.has(id)) return id;
  }
  return undefined;
}
