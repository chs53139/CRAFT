"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getReviewsForCocktail,
  submitCocktailReview,
  summarizeReviews,
} from "@/lib/cocktail-reviews";
import { CocktailReview, CocktailReviewInput } from "@/lib/types";

export function useCocktailReviews(cocktailId: string) {
  const [reviews, setReviews] = useState<CocktailReview[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    setReviews(getReviewsForCocktail(cocktailId));
    setLoaded(true);
  }, [cocktailId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const summary = useMemo(() => summarizeReviews(reviews), [reviews]);
  const ownReview = useMemo(
    () => reviews.find((review) => review.isOwn) ?? null,
    [reviews]
  );

  const submitReview = useCallback(
    (input: CocktailReviewInput) => {
      const next = submitCocktailReview(cocktailId, input);
      setReviews(next);
      return next;
    },
    [cocktailId]
  );

  return {
    reviews,
    summary,
    ownReview,
    loaded,
    submitReview,
    refresh,
  };
}
