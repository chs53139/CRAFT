import Link from "next/link";

type Props = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: string;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon = "🥃",
}: Props) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 px-6 py-14 text-center">
      <p className="text-3xl" aria-hidden>
        {icon}
      </p>
      <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl text-[var(--foreground)]">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--muted)]">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-6 inline-block rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[#070708] transition hover:brightness-110"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
