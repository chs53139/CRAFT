import { CocktailReview, CocktailReviewSummary } from "@/lib/types";

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
