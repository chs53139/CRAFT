import Link from "next/link";

type Stat = {
  value: string | number;
  label: string;
  href?: string;
};

export type HomeStatGroup = {
  ready: Stat;
  withSwaps: Stat;
  oneAway: Stat;
  library: Stat;
  mocktails: Stat;
};

type Props = {
  stats: HomeStatGroup;
  centerAction?: React.ReactNode;
};

function StatPill({ stat }: { stat: Stat }) {
  if (stat.href) {
    return (
      <Link href={stat.href} className="stat-pill stat-pill-link">
        <p className="stat-pill-value">{stat.value}</p>
        <p className="stat-pill-label">{stat.label}</p>
      </Link>
    );
  }

  return (
    <div className="stat-pill">
      <p className="stat-pill-value">{stat.value}</p>
      <p className="stat-pill-label">{stat.label}</p>
    </div>
  );
}

export function StatPills({ stats, centerAction }: Props) {
  if (centerAction) {
    return (
      <div className="stat-pills">
        <div className="stat-pills-row stat-pills-row-three">
          <StatPill stat={stats.ready} />
          {centerAction}
          <StatPill stat={stats.withSwaps} />
        </div>
        <div className="stat-pills-row stat-pills-row-three">
          <StatPill stat={stats.oneAway} />
          <StatPill stat={stats.library} />
          <StatPill stat={stats.mocktails} />
        </div>
      </div>
    );
  }

  const mocktailsHref = stats.mocktails.href ?? "/discover?type=mocktails";

  return (
    <div className="stat-pills">
      <div className="stat-pills-grid-2x2">
        <StatPill stat={stats.ready} />
        <StatPill stat={stats.withSwaps} />
        <StatPill stat={stats.oneAway} />
        <StatPill stat={stats.library} />
      </div>
      <Link href={mocktailsHref} className="stat-pills-secondary-link">
        <span className="stat-pills-secondary-label">{stats.mocktails.label}</span>
        <span className="stat-pills-secondary-meta">
          {stats.mocktails.value} zero-proof
          <span className="stat-pills-secondary-arrow" aria-hidden>
            →
          </span>
        </span>
      </Link>
    </div>
  );
}

export function StatPillAction({
  href,
  label,
}: {
  href: string;
  label: string;
  subtitle?: string;
}) {
  return (
    <Link href={href} className="stat-pill-action">
      <span className="stat-pill-action-icon" aria-hidden>
        ✦
      </span>
      <span className="stat-pill-action-label">{label}</span>
    </Link>
  );
}
