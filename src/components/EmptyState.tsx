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
    <div className="premium-card animate-fade-in-up border-dashed px-6 py-16 text-center sm:px-10 sm:py-20">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background-elevated)] text-2xl">
        <span aria-hidden>{icon}</span>
      </div>
      <h3 className="mt-6 font-[family-name:var(--font-display)] text-2xl font-medium text-[var(--foreground)]">
        {title}
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)]">
        {description}
      </p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn-primary mt-8">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
