import Link from "next/link";
import { HomeDashboard } from "@/components/HomeDashboard";
import { HeroStats } from "@/components/HeroStats";

export default function HomePage() {
  return (
    <>
      <section className="hero-glow relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 md:pb-24 md:pt-24">
          <p className="eyebrow animate-fade-in">CRAFT</p>
          <h1 className="display-xl mt-5 max-w-3xl animate-fade-in-up animate-delay-1">
            Your bar knows more than you think.
          </h1>
          <p className="lead mt-6 max-w-lg animate-fade-in-up animate-delay-2">
            Tell us what&apos;s on your shelf. We&apos;ll tell you what to pour,
            what you&apos;re one bottle from, and exactly what to buy next.
            No judgment. Okay, a little judgment.
          </p>

          <div className="mt-10 flex flex-col gap-3 animate-fade-in-up animate-delay-3 sm:flex-row sm:items-center sm:gap-4">
            <Link href="/bar" className="btn-primary">
              Stock My Bar
            </Link>
            <Link href="/cocktails" className="btn-secondary">
              See Tonight&apos;s Menu
            </Link>
          </div>

          <div className="animate-fade-in-up animate-delay-3">
            <HeroStats />
          </div>
        </div>
      </section>

      <HomeDashboard />
    </>
  );
}
