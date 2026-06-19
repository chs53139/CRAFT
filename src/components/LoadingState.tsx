export function PageLoader({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-6 py-24">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
      <p className="mt-4 text-sm text-[var(--muted)]">{message}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
      <div className="aspect-[4/3] animate-pulse bg-[var(--border)]/40" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-20 animate-pulse rounded bg-[var(--border)]/50" />
        <div className="h-6 w-3/4 animate-pulse rounded bg-[var(--border)]/50" />
        <div className="h-4 w-full animate-pulse rounded bg-[var(--border)]/40" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
