import Link from "next/link";

type Stat = {
  value: string | number;
  label: string;
  href?: string;
};

type Props = {
  /** Left and right stats on the top row (Mixologist sits between them). */
  topRow: [Stat, Stat];
  /** Three stats on the bottom row. */
  bottomRow: [Stat, Stat, Stat];
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

export function StatPills({ topRow, bottomRow, centerAction }: Props) {
  return (
    <div className="stat-pills">
      <div className="stat-pills-row">
        <StatPill stat={topRow[0]} />
        {centerAction ?? <div className="stat-pill-spacer" aria-hidden />}
        <StatPill stat={topRow[1]} />
      </div>
      <div className="stat-pills-row">
        {bottomRow.map((stat) => (
          <StatPill key={stat.label} stat={stat} />
        ))}
      </div>
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
