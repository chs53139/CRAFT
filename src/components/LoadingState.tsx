export function PageLoader({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="page-shell flex min-h-[50vh] flex-col items-center justify-center">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <div
          className="absolute inset-0 rounded-full border border-[var(--border)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--accent)] motion-safe:animate-[loader-spin_0.9s_linear_infinite]"
          aria-hidden
        />
        <span
          className="font-[family-name:var(--font-display)] text-[10px] tracking-[0.35em] text-[var(--accent-dim)] motion-safe:animate-[loader-pulse_2s_ease-in-out_infinite]"
          aria-hidden
        >
          C
        </span>
      </div>
      <p className="mt-6 text-sm tracking-wide text-[var(--muted)]">{message}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="premium-card overflow-hidden">
      <div className="aspect-[4/3] shimmer" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-20 rounded-full shimmer" />
        <div className="h-7 w-3/4 rounded-lg shimmer" />
        <div className="h-4 w-full rounded-lg shimmer" />
        <div className="h-4 w-2/3 rounded-lg shimmer" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="stagger-grid grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function BarPageSkeleton() {
  return (
    <div className="page-shell space-y-8">
      <div className="space-y-3">
        <div className="h-3 w-24 rounded-full shimmer" />
        <div className="h-10 w-48 rounded-lg shimmer" />
        <div className="h-4 w-64 rounded-lg shimmer" />
      </div>
      <div className="premium-card h-36 shimmer" />
      <div className="space-y-4">
        <div className="h-8 w-40 rounded-lg shimmer" />
        <div className="h-12 max-w-md rounded-xl shimmer" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-20 shrink-0 rounded-full shimmer" />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-11 w-28 rounded-full shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function MenuPageSkeleton() {
  return (
    <div className="page-shell space-y-10">
      <div className="space-y-3">
        <div className="h-3 w-28 rounded-full shimmer" />
        <div className="h-10 w-56 rounded-lg shimmer" />
        <div className="h-4 w-72 rounded-lg shimmer" />
      </div>
      <div className="h-12 max-w-md rounded-xl shimmer" />
      <div className="premium-card h-28 shimmer" />
      <SkeletonGrid count={6} />
    </div>
  );
}
