import Link from "next/link";
import { BarHealthReport } from "@/lib/bar-intelligence";

type Props = {
  report: BarHealthReport;
  compact?: boolean;
};

export function BarHealthCard({ report, compact }: Props) {
  const { score, grade, utilizationPercent, tasteProfile, insights, redundancies, gaps } =
    report;

  return (
    <section className="bar-health-card animate-fade-in-up">
      <div className="bar-health-header">
        <div>
          <p className="eyebrow">Bar intelligence</p>
          <h2 className="section-row-title mt-2">
            {tasteProfile?.personality.label ?? "Your bar"}
          </h2>
          {!compact && (
            <p className="section-row-subtitle mt-1">
              {tasteProfile?.personality.description ??
                "Favorite and browse drinks to build your taste profile."}
            </p>
          )}
        </div>
        <div className="bar-health-score" aria-label={`Bar health score ${score}`}>
          <span className="bar-health-score-value">{score}</span>
          <span className="bar-health-score-label">Health · {grade}</span>
        </div>
      </div>

      <div className={`bar-health-metrics ${compact ? "bar-health-metrics-compact" : ""}`}>
        <div className="bar-health-metric">
          <p className="bar-health-metric-label">Utilization</p>
          <p className="bar-health-metric-value">{utilizationPercent}%</p>
        </div>
        {tasteProfile && (
          <>
            <div className="bar-health-metric">
              <p className="bar-health-metric-label">Adventurous</p>
              <p className="bar-health-metric-value">{tasteProfile.adventurousnessScore}</p>
            </div>
            <div className="bar-health-metric">
              <p className="bar-health-metric-label">Discovery</p>
              <p className="bar-health-metric-value">{tasteProfile.discoveryScore}</p>
            </div>
          </>
        )}
        {redundancies.length > 0 && (
          <div className="bar-health-metric">
            <p className="bar-health-metric-label">Overlap</p>
            <p className="bar-health-metric-value">{redundancies.length}</p>
          </div>
        )}
        {gaps.length > 0 && (
          <div className="bar-health-metric">
            <p className="bar-health-metric-label">Gaps</p>
            <p className="bar-health-metric-value">{gaps.length}</p>
          </div>
        )}
      </div>

      {tasteProfile && tasteProfile.dominantFlavors.length > 0 && !compact && (
        <div className="bar-health-flavors">
          {tasteProfile.dominantFlavors.map((flavor) => (
            <span key={flavor} className="bar-health-flavor-chip">
              {flavor.replace(/-/g, " ")}
            </span>
          ))}
        </div>
      )}

      <ul className="bar-health-insights">
        {insights.slice(0, compact ? 2 : 3).map((insight) => (
          <li key={insight}>{insight}</li>
        ))}
      </ul>

      <Link href="/bar" className="bar-health-link">
        View full bar analysis →
      </Link>
    </section>
  );
}
