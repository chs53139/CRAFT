"use client";

import { useState } from "react";
import { StarRating } from "@/components/StarRating";
import { useMadeHistory } from "@/components/MadeHistoryProvider";
import { useCocktailReviews } from "@/hooks/use-cocktail-reviews";

type Props = {
  cocktailId: string;
};

export function MadeItButton({ cocktailId }: Props) {
  const { recordMade } = useMadeHistory();
  const { submitReview, isAuthenticated, reviewsUnavailable } = useCocktailReviews(cocktailId);
  const [phase, setPhase] = useState<"idle" | "rate" | "done">("idle");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  async function finish(ratingValue?: number) {
    recordMade(cocktailId, ratingValue);
    if (
      ratingValue &&
      ratingValue >= 1 &&
      isAuthenticated &&
      !reviewsUnavailable
    ) {
      setSubmitting(true);
      try {
        await submitReview({
          rating: ratingValue,
          text: "",
          wouldMakeAgain: ratingValue >= 4,
        });
      } catch {
        /* made history still recorded locally */
      } finally {
        setSubmitting(false);
      }
    }
    setPhase("done");
    window.setTimeout(() => setPhase("idle"), 2200);
  }

  if (phase === "done") {
    return (
      <button type="button" className="made-it-btn made-it-btn-done" disabled>
        Logged ✓
      </button>
    );
  }

  if (phase === "rate") {
    return (
      <div className="made-it-rate">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-dim)]">
          How was it?
        </p>
        <StarRating value={rating} onChange={setRating} />
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            className="btn-secondary flex-1 text-sm"
            disabled={submitting}
            onClick={() => void finish()}
          >
            Skip
          </button>
          <button
            type="button"
            className="btn-primary flex-1 text-sm"
            disabled={submitting || rating < 1}
            onClick={() => void finish(rating)}
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="made-it-btn"
      onClick={() => setPhase("rate")}
    >
      Made it ✓
    </button>
  );
}
