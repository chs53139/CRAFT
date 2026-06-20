"use client";

type Props = {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  label?: string;
};

const SIZE_CLASS = {
  sm: "star-rating-sm",
  md: "star-rating-md",
  lg: "star-rating-lg",
} as const;

export function StarRating({ value, onChange, size = "md", label }: Props) {
  const interactive = !!onChange;
  const rounded = interactive ? value : Math.round(value);

  return (
    <div
      className={`star-rating ${SIZE_CLASS[size]}`}
      role={interactive ? "radiogroup" : "img"}
      aria-label={label ?? `${rounded} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= rounded;

        if (interactive) {
          return (
            <button
              key={star}
              type="button"
              className={`star-rating-star ${value >= star ? "star-rating-star-active" : ""}`}
              onClick={() => onChange(star)}
              aria-label={`${star} star${star === 1 ? "" : "s"}`}
              aria-pressed={value >= star}
            >
              ★
            </button>
          );
        }

        return (
          <span
            key={star}
            className={`star-rating-star ${filled ? "star-rating-star-active" : ""}`}
            aria-hidden
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

export function formatRating(value: number): string {
  if (value === 0) return "—";
  return value.toFixed(1);
}
