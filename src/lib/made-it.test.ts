import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Made It rating semantics", () => {
  const madeItSource = readFileSync(
    join(process.cwd(), "src/components/MadeItButton.tsx"),
    "utf8"
  );
  const reviewsRoute = readFileSync(join(process.cwd(), "src/app/api/reviews/route.ts"), "utf8");

  it("does not infer wouldMakeAgain from star rating", () => {
    expect(madeItSource).not.toMatch(/wouldMakeAgain/);
    expect(madeItSource).not.toMatch(/submitReview/);
    expect(madeItSource).not.toMatch(/ratingValue\s*>=\s*4/);
  });

  it("reviews API still requires explicit wouldMakeAgain for full reviews", () => {
    expect(reviewsRoute).toContain('typeof wouldMakeAgain !== "boolean"');
  });

  it("Made It remains separate from Favorite on cocktail detail", () => {
    const detail = readFileSync(
      join(process.cwd(), "src/app/cocktails/[id]/CocktailDetailClient.tsx"),
      "utf8"
    );
    expect(detail).toContain("MadeItButton");
    expect(detail).toMatch(/Favorite|favorite/);
  });
});
