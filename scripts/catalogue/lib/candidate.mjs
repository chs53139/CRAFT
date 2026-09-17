/**
 * Wrap a catalogue cocktail record with batch-1 provenance metadata.
 * @param {Record<string, unknown>} fields
 */
export function candidate(fields) {
  const {
    classification = "new_canonical",
    verificationState = "verified",
    sourceTier,
    sourceTitle,
    sourceAuthor,
    sourceUrl = "",
    sourceRecipe,
    recipeProvenance,
    historicalNotes,
    creator = null,
    bar = null,
    city = null,
    creationYear = null,
    alternateNames = [],
    imageStatus = "placeholder",
    rarity,
    funFact,
    yearInvented = null,
    regionOfOrigin = null,
    cocktail,
  } = fields;

  return {
    classification,
    verificationState,
    sourceTier,
    sourceTitle,
    sourceAuthor,
    sourceUrl,
    sourceRecipe,
    recipeProvenance,
    historicalNotes,
    creator,
    bar,
    city,
    creationYear,
    alternateNames,
    imageStatus,
    rarity,
    funFact,
    yearInvented,
    regionOfOrigin,
    cocktail,
  };
}

/** @param {Record<string, unknown>} fields */
export function cocktail(fields) {
  const {
    name,
    slug,
    glass,
    family,
    method,
    tags = [],
    ingredients,
    garnish = [],
    preparation,
  } = fields;
  return { name, slug, glass, family, method, tags, ingredients, garnish, preparation };
}
