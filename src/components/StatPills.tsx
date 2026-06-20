import Link from "next/link";

type Stat = {
  value: string | number;
  label: string;
  href?: string;
};

type Props = {
  stats: Stat[];
  trailingAction?: React.ReactNode;
};

export function StatPills({ stats, trailingAction }: Props) {
  return (
    <div className="stat-pills">
      {stats.map((stat) =>
        stat.href ? (
          <Link key={stat.label} href={stat.href} className="stat-pill stat-pill-link">
            <p className="stat-pill-value">{stat.value}</p>
            <p className="stat-pill-label">{stat.label}</p>
          </Link>
        ) : (
          <div key={stat.label} className="stat-pill">
            <p className="stat-pill-value">{stat.value}</p>
            <p className="stat-pill-label">{stat.label}</p>
          </div>
        )
      )}
      {trailingAction}
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
