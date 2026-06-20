"use client";

import { FormEvent, useEffect, useState } from "react";
import { formatReviewDate } from "@/lib/cocktail-reviews";
import { useCocktailReviews } from "@/hooks/use-cocktail-reviews";
import { formatRating, StarRating } from "@/components/StarRating";

type Props = {
  cocktailId: string;
  cocktailName: string;
};

export function CocktailReviews({ cocktailId, cocktailName }: Props) {
  const { reviews, summary, ownReview, loaded, submitReview } = useCocktailReviews(cocktailId);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [wouldMakeAgain, setWouldMakeAgain] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ownReview) return;
    setRating(ownReview.rating);
    setText(ownReview.text);
    setWouldMakeAgain(ownReview.wouldMakeAgain);
  }, [ownReview]);

  if (!loaded) {
    return (
      <section className="app-section">
        <div className="review-card review-card-loading">
          <div className="h-5 w-32 shimmer rounded-md" />
          <div className="mt-4 h-10 w-full shimmer rounded-xl" />
        </div>
      </section>
    );
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (rating < 1) {
      setError("Pick a star rating first.");
      return;
    }

    if (wouldMakeAgain === null) {
      setError("Let us know if you'd make this again.");
      return;
    }

    submitReview({ rating, text, wouldMakeAgain });
    setSubmitted(true);
    window.setTimeout(() => setSubmitted(false), 2400);
  }

  const displayReviews = reviews.slice(0, 5);

  return (
    <section className="app-section">
      <div className="review-card">
        <div className="review-summary">
          <div>
            <p className="eyebrow text-[var(--accent-dim)]">CRAFT ratings</p>
            <div className="review-summary-score">
              <span className="review-average">{formatRating(summary.averageRating)}</span>
              <StarRating value={summary.averageRating} size="sm" />
            </div>
          </div>
          <div className="review-summary-meta">
            <p className="review-count">
              {summary.reviewCount} review{summary.reviewCount === 1 ? "" : "s"}
            </p>
            {summary.reviewCount > 0 && (
              <p className="review-repeat">
                {summary.wouldMakeAgainPercent}% would make again
              </p>
            )}
          </div>
        </div>

        <form className="review-form" onSubmit={handleSubmit}>
          <h3 className="review-form-title">
            {ownReview ? "Update your review" : `Rate the ${cocktailName}`}
          </h3>

          <label className="review-field-label">Your rating</label>
          <StarRating value={rating} onChange={setRating} size="lg" />

          <label className="review-field-label mt-5" htmlFor={`review-text-${cocktailId}`}>
            Short review
          </label>
          <textarea
            id={`review-text-${cocktailId}`}
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={280}
            rows={3}
            placeholder="What stood out? Balance, finish, vibe at home…"
            className="review-textarea"
          />
          <p className="review-char-count">{text.length}/280</p>

          <p className="review-field-label mt-5">Would make again?</p>
          <div className="review-toggle-row">
            <button
              type="button"
              className={`surprise-chip ${wouldMakeAgain === true ? "surprise-chip-active" : ""}`}
              onClick={() => setWouldMakeAgain(true)}
            >
              Yes
            </button>
            <button
              type="button"
              className={`surprise-chip ${wouldMakeAgain === false ? "surprise-chip-active" : ""}`}
              onClick={() => setWouldMakeAgain(false)}
            >
              No
            </button>
          </div>

          {error && <p className="review-error">{error}</p>}

          <button type="submit" className="btn-primary mt-5 w-full">
            {submitted
              ? "Review saved"
              : ownReview
                ? "Update review"
                : "Submit review"}
          </button>
        </form>

        {displayReviews.length > 0 && (
          <div className="review-list">
            <h3 className="review-list-title">Recent reviews</h3>
            <ul className="review-list-items">
              {displayReviews.map((review) => (
                <li key={review.id} className="review-list-item">
                  <div className="review-list-header">
                    <div>
                      <p className="review-author">
                        {review.authorLabel}
                        {review.isOwn && <span className="review-you-badge">You</span>}
                      </p>
                      <p className="review-date">{formatReviewDate(review.createdAt)}</p>
                    </div>
                    <StarRating value={review.rating} size="sm" />
                  </div>
                  {review.text && <p className="review-text">{review.text}</p>}
                  <p className="review-repeat-line">
                    {review.wouldMakeAgain ? "Would make again" : "Probably not again"}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
