import {
  CocktailReview,
  CocktailReviewInput,
  CocktailReviewSummary,
} from "@/lib/types";

const REVIEWS_KEY = "craft-cocktail-reviews";
const REVIEWS_SEEDED_KEY = "craft-cocktail-reviews-seeded";

const SEED_REVIEWS: CocktailReview[] = [
  {
    id: "seed-margarita-1",
    cocktailId: "margarita",
    rating: 5,
    text: "Perfect balance of tart and tequila. Salt rim is non-negotiable.",
    wouldMakeAgain: true,
    createdAt: "2025-11-12T18:30:00.000Z",
    authorLabel: "Alex",
  },
  {
    id: "seed-margarita-2",
    cocktailId: "margarita",
    rating: 4,
    text: "Classic for a reason. A little sharp without enough agave for me.",
    wouldMakeAgain: true,
    createdAt: "2025-10-28T21:10:00.000Z",
    authorLabel: "Jordan",
  },
  {
    id: "seed-negroni-1",
    cocktailId: "negroni",
    rating: 5,
    text: "Bitter, bold, and impossible to put down. My default aperitivo.",
    wouldMakeAgain: true,
    createdAt: "2025-12-01T19:45:00.000Z",
    authorLabel: "Sam",
  },
  {
    id: "seed-negroni-2",
    cocktailId: "negroni",
    rating: 4,
    text: "An acquired taste that pays off. Campari-forward in the best way.",
    wouldMakeAgain: true,
    createdAt: "2025-09-15T20:00:00.000Z",
    authorLabel: "Riley",
  },
  {
    id: "seed-old-fashioned-1",
    cocktailId: "old-fashioned",
    rating: 5,
    text: "Whiskey, bitters, one cube. Nothing else needed.",
    wouldMakeAgain: true,
    createdAt: "2025-11-20T22:15:00.000Z",
    authorLabel: "Morgan",
  },
  {
    id: "seed-old-fashioned-2",
    cocktailId: "old-fashioned",
    rating: 3,
    text: "Solid but I prefer mine with a touch more sweetness.",
    wouldMakeAgain: false,
    createdAt: "2025-08-04T17:30:00.000Z",
    authorLabel: "Casey",
  },
  {
    id: "seed-martini-1",
    cocktailId: "martini",
    rating: 5,
    text: "Ice-cold, gin-forward elegance. Olive or twist — dealer's choice.",
    wouldMakeAgain: true,
    createdAt: "2025-10-05T23:00:00.000Z",
    authorLabel: "Taylor",
  },
  {
    id: "seed-daiquiri-1",
    cocktailId: "daiquiri",
    rating: 4,
    text: "Underrated when made properly. Fresh lime makes all the difference.",
    wouldMakeAgain: true,
    createdAt: "2025-07-18T19:20:00.000Z",
    authorLabel: "Jamie",
  },
  {
    id: "seed-penicillin-1",
    cocktailId: "penicillin",
    rating: 5,
    text: "Smoky, gingery, and somehow comforting. A modern classic.",
    wouldMakeAgain: true,
    createdAt: "2025-12-08T21:40:00.000Z",
    authorLabel: "Quinn",
  },
  {
    id: "seed-espresso-martini-1",
    cocktailId: "espresso-martini",
    rating: 4,
    text: "Dessert and digestif in one glass. Dangerously drinkable.",
    wouldMakeAgain: true,
    createdAt: "2025-11-02T00:30:00.000Z",
    authorLabel: "Avery",
  },
];

function readAllReviews(): CocktailReview[] {
  if (typeof window === "undefined") return SEED_REVIEWS;

  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CocktailReview[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAllReviews(reviews: CocktailReview[]) {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
}

export function ensureReviewSeedData() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(REVIEWS_SEEDED_KEY)) return;

  const existing = readAllReviews();
  const seedIds = new Set(SEED_REVIEWS.map((review) => review.id));
  const merged = [
    ...SEED_REVIEWS,
    ...existing.filter((review) => !seedIds.has(review.id)),
  ];

  writeAllReviews(merged);
  localStorage.setItem(REVIEWS_SEEDED_KEY, "1");
}

export function getReviewsForCocktail(cocktailId: string): CocktailReview[] {
  ensureReviewSeedData();
  return readAllReviews()
    .filter((review) => review.cocktailId === cocktailId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getOwnReview(cocktailId: string): CocktailReview | null {
  return getReviewsForCocktail(cocktailId).find((review) => review.isOwn) ?? null;
}

export function summarizeReviews(reviews: CocktailReview[]): CocktailReviewSummary {
  if (reviews.length === 0) {
    return { averageRating: 0, reviewCount: 0, wouldMakeAgainPercent: 0 };
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const wouldMakeAgainCount = reviews.filter((review) => review.wouldMakeAgain).length;

  return {
    averageRating: Math.round((totalRating / reviews.length) * 10) / 10,
    reviewCount: reviews.length,
    wouldMakeAgainPercent: Math.round((wouldMakeAgainCount / reviews.length) * 100),
  };
}

export function getReviewSummary(cocktailId: string): CocktailReviewSummary {
  return summarizeReviews(getReviewsForCocktail(cocktailId));
}

export function submitCocktailReview(
  cocktailId: string,
  input: CocktailReviewInput
): CocktailReview[] {
  ensureReviewSeedData();

  const rating = Math.min(5, Math.max(1, Math.round(input.rating)));
  const text = input.text.trim().slice(0, 280);
  const all = readAllReviews().filter(
    (review) => !(review.cocktailId === cocktailId && review.isOwn)
  );

  const review: CocktailReview = {
    id: `own-${cocktailId}-${Date.now()}`,
    cocktailId,
    rating,
    text,
    wouldMakeAgain: input.wouldMakeAgain,
    createdAt: new Date().toISOString(),
    authorLabel: "You",
    isOwn: true,
  };

  writeAllReviews([review, ...all]);
  return getReviewsForCocktail(cocktailId);
}

export function formatReviewDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Recently";

  const diffMs = Date.now() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} wk ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
