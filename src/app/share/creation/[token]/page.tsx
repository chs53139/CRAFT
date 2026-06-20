import type { Metadata } from "next";
import Link from "next/link";
import { CreationShareActions } from "@/app/share/creation/[token]/CreationShareActions";
import { FlavorTags } from "@/components/FlavorTags";
import { EmptyState } from "@/components/EmptyState";
import { ScreenHeader } from "@/components/ScreenHeader";
import { decodeInventionToken } from "@/lib/invention-share";
import { buildInventionShareMetadata } from "@/lib/share-metadata";

type PageProps = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const invention = decodeInventionToken(token);

  if (!invention) {
    return { title: "Creation not found" };
  }

  return buildInventionShareMetadata(invention);
}

export default async function CreationSharePage({ params }: PageProps) {
  const { token } = await params;
  const invention = decodeInventionToken(token);

  if (!invention) {
    return (
      <div className="app-screen">
        <EmptyState
          title="Creation not found"
          description="This shared recipe link may be incomplete or expired."
          actionLabel="Open Mixologist"
          actionHref="/mixologist"
          icon="🧪"
        />
      </div>
    );
  }

  return (
    <div className="app-screen animate-fade-in">
      <ScreenHeader
        title={invention.name}
        subtitle="CRAFT Original · shared recipe"
        large
        action={<CreationShareActions invention={invention} token={token} />}
      />

      <div className="premium-card mt-6 p-5">
        <p className="eyebrow">CRAFT Original</p>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{invention.tagline}</p>
        <div className="mt-4">
          <FlavorTags flavors={invention.flavorProfile} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="glass-panel rounded-xl px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">Method</p>
            <p className="mt-2 text-sm text-[var(--foreground)]">{invention.method}</p>
          </div>
          <div className="glass-panel rounded-xl px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">Glass</p>
            <p className="mt-2 text-sm text-[var(--foreground)]">{invention.glassware}</p>
          </div>
        </div>
      </div>

      <section className="app-section">
        <h2 className="section-row-title">Ingredients</h2>
        <ul className="mt-4 space-y-2">
          {invention.ingredients.map((item) => (
            <li key={`${item.name}-${item.amount}`} className="mixologist-recipe-row">
              <span className="text-sm text-[var(--foreground)]">{item.name}</span>
              <span className="text-sm text-[var(--accent-dim)]">{item.amount}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="app-section">
        <h2 className="section-row-title">Instructions</h2>
        <ol className="mt-4 space-y-3">
          {invention.instructions.map((step, index) => (
            <li key={index} className="flex gap-3 text-sm leading-relaxed text-[var(--foreground)]">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--accent)]/30 text-xs text-[var(--accent)]">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <Link href="/mixologist" className="btn-primary mt-2 inline-flex w-full justify-center">
        Invent your own
      </Link>
    </div>
  );
}
