"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { summarizeReviews } from "@/lib/cocktail-reviews";
import {
  fetchReviewsForCocktail,
  upsertCocktailReview,
} from "@/lib/supabase/reviews-sync";
import { createClient } from "@/lib/supabase/client";
import { CocktailReview, CocktailReviewInput } from "@/lib/types";
import { useUserData } from "@/hooks/use-my-bar";

export function useCocktailReviews(cocktailId: string) {
  const { user, isAuthenticated } = useUserData();
  const supabase = useMemo(() => createClient(), []);
  const [reviews, setReviews] = useState<CocktailReview[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    setError(null);

    try {
      const data = await fetchReviewsForCocktail(supabase, cocktailId, user?.id);
      setReviews(data);
    } catch {
      setError("Could not load reviews right now.");
      setReviews([]);
    } finally {
      setLoaded(true);
    }
  }, [supabase, cocktailId, user?.id]);

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
      if (!user) {
        throw new Error("Sign in to review.");
      }

      setSubmitting(true);
      setError(null);

      try {
        await upsertCocktailReview(supabase, user.id, cocktailId, input);
        await loadReviews();
      } catch {
        setError("Could not save your review. Try again.");
        throw new Error("Could not save your review. Try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [supabase, user, cocktailId, loadReviews]
  );

  return {
    reviews,
    summary,
    ownReview,
    loaded,
    submitting,
    error,
    isAuthenticated,
    submitReview,
    refresh: loadReviews,
    clearError: () => setError(null),
  };
}
