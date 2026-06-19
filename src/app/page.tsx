import Link from "next/link";
import { HomeDashboard } from "@/components/HomeDashboard";
import { cocktailCount } from "@/lib/cocktail-matching";

export default function HomePage() {
  return (
    <>
      <section className="hero-glow relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-16 md:pb-24 md:pt-28 sm:px-6">
          <p className="text-xs uppercase tracking-[0.45em] text-[var(--accent)]">
            CRAFT
          </p>
          <h1 className="mt-6 max-w-3xl font-[family-name:var(--font-display)] text-5xl font-light leading-[1.1] tracking-tight text-[var(--foreground)] md:text-7xl">
            Your bar knows more than you think.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--muted)]">
            Tell us what&apos;s on your shelf. We&apos;ll tell you what to pour,
            what you&apos;re one bottle from, and exactly what to buy next.
            No judgment. Okay, a little judgment.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/bar"
              className="rounded-full bg-[var(--accent)] px-8 py-3.5 text-sm font-semibold text-[#070708] transition hover:brightness-110"
            >
              Stock My Bar
            </Link>
            <Link
              href="/cocktails"
              className="rounded-full border border-[var(--border)] px-8 py-3.5 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]/50"
            >
              What Can I Make?
            </Link>
          </div>

          <div className="mt-16 grid gap-6 border-t border-[var(--border)] pt-10 sm:grid-cols-3">
            <div>
              <p className="font-[family-name:var(--font-display)] text-3xl text-[var(--accent)]">
                {cocktailCount}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Classic & modern cocktails
              </p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-display)] text-3xl text-[var(--accent)]">
                1
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Bottle away from greatness
              </p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-display)] text-3xl text-[var(--accent)]">
                0
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Excuses needed tonight
              </p>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-[var(--accent)]/5 blur-3xl" />
      </section>

      <HomeDashboard />
    </>
  );
}
