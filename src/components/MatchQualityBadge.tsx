import { MatchQuality } from "@/lib/substitutions/types";

const LABELS: Record<Exclude<MatchQuality, "unavailable">, string> = {
  exact: "Exact Match",
  substitution: "Substitution",
  experimental: "Experimental",
  missing: "Still Missing",
};

type Props = {
  quality: MatchQuality;
  compact?: boolean;
};

export function MatchQualityBadge({ quality, compact }: Props) {
  if (quality === "unavailable" || quality === "missing") return null;

  const label = LABELS[quality];

  return (
    <span
      className={`match-quality-badge match-quality-${quality} ${compact ? "match-quality-compact" : ""}`}
    >
      {label}
    </span>
  );
}
