type Stat = {
  value: string | number;
  label: string;
};

type Props = {
  stats: Stat[];
};

export function StatPills({ stats }: Props) {
  return (
    <div className="stat-pills">
      {stats.map((stat) => (
        <div key={stat.label} className="stat-pill">
          <p className="stat-pill-value">{stat.value}</p>
          <p className="stat-pill-label">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
