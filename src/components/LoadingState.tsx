export function PageLoader({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="app-screen flex min-h-[60dvh] flex-col items-center justify-center">
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
      <div className="space-y-3 p-4">
        <div className="h-3 w-20 rounded-full shimmer" />
        <div className="h-6 w-3/4 rounded-lg shimmer" />
        <div className="h-4 w-full rounded-lg shimmer" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="list-card-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function BarPageSkeleton() {
  return (
    <div className="app-screen space-y-6">
      <div className="space-y-3">
        <div className="h-8 w-32 shimmer rounded-xl" />
        <div className="h-4 w-48 shimmer rounded-lg" />
      </div>
      <div className="premium-card h-28 shimmer" />
      <div className="space-y-4">
        <div className="h-12 rounded-xl shimmer" />
        <div className="flex gap-2 overflow-hidden">
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
    <div className="app-screen space-y-6">
      <div className="space-y-3">
        <div className="h-8 w-36 shimmer rounded-xl" />
        <div className="h-4 w-52 shimmer rounded-lg" />
      </div>
      <div className="h-12 rounded-xl shimmer" />
      <div className="premium-card h-24 shimmer" />
      <SkeletonGrid count={4} />
    </div>
  );
}
