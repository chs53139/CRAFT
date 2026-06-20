"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { summarizeReviews } from "@/lib/cocktail-reviews";
import { humanizeReviewError } from "@/lib/review-errors";
import { CocktailReview, CocktailReviewInput } from "@/lib/types";
import { useUserData } from "@/hooks/use-my-bar";

type ReviewsResponse = {
  reviews?: CocktailReview[];
  reviewsUnavailable?: boolean;
  error?: string;
};

export function useCocktailReviews(cocktailId: string) {
  const { isAuthenticated } = useUserData();
  const [reviews, setReviews] = useState<CocktailReview[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewsUnavailable, setReviewsUnavailable] = useState(false);

  const loadReviews = useCallback(async () => {
    setError(null);
    setReviewsUnavailable(false);

    try {
      const response = await fetch(
        `/api/reviews?cocktailId=${encodeURIComponent(cocktailId)}`
      );
      const data = (await response.json()) as ReviewsResponse;

      if (data.reviewsUnavailable) {
        setReviewsUnavailable(true);
        setReviews([]);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error ?? "Could not load reviews right now.");
      }

      setReviews(data.reviews ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Could not load reviews right now."
      );
      setReviews([]);
    } finally {
      setLoaded(true);
    }
  }, [cocktailId]);

  useEffect(() => {
    setLoaded(false);
    loadReviews();
  }, [loadReviews]);

  const summary = useMemo(() => summarizeReviews(reviews), [reviews]);
  const ownReview = useMemo(
    () => reviews.find((review) => review.isOwn) ?? null,
    [reviews]
  );

  const submitReview = useCallback(
    async (input: CocktailReviewInput) => {
      if (!isAuthenticated) {
        throw new Error("Sign in to review.");
      }

      setSubmitting(true);
      setError(null);

      try {
        const response = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cocktailId,
            rating: input.rating,
            text: input.text,
            wouldMakeAgain: input.wouldMakeAgain,
          }),
        });

        const data = (await response.json()) as ReviewsResponse;

        if (data.reviewsUnavailable) {
          setReviewsUnavailable(true);
          throw new Error("Reviews are not enabled on this server yet.");
        }

        if (!response.ok) {
          throw new Error(data.error ?? humanizeReviewError(null));
        }

        setReviews(data.reviews ?? []);
      } catch (submitError) {
        const message =
          submitError instanceof Error
            ? submitError.message
            : humanizeReviewError(submitError);
        setError(message);
        throw new Error(message);
      } finally {
        setSubmitting(false);
      }
    },
    [cocktailId, isAuthenticated]
  );

  return {
    reviews,
    summary,
    ownReview,
    loaded,
    submitting,
    error,
    reviewsUnavailable,
    isAuthenticated,
    submitReview,
    refresh: loadReviews,
    clearError: () => setError(null),
  };
}
