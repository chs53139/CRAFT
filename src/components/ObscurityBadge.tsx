type Props = {
  score: number;
  compact?: boolean;
};

function labelForScore(score: number): string {
  if (score >= 80) return "Deep cut";
  if (score >= 65) return "Hidden gem";
  if (score >= 45) return "Under the radar";
  return "Well known";
}

export function ObscurityBadge({ score, compact }: Props) {
  const label = labelForScore(score);

  return (
    <div className={compact ? "obscurity-badge obscurity-badge-compact" : "obscurity-badge"}>
      <div className="obscurity-badge-top">
        <span className="obscurity-badge-label">{label}</span>
        <span className="obscurity-badge-score">{score}</span>
      </div>
      {!compact && (
        <div className="obscurity-meter" aria-hidden>
          <span className="obscurity-meter-fill" style={{ width: `${score}%` }} />
        </div>
      )}
    </div>
  );
}
