import Link from "next/link";
import { FlavorTags } from "@/components/FlavorTags";
import { ShareInventionButton } from "@/components/ShareCocktailButton";
import { MixologistInvention } from "@/lib/mixologist/types";

const SOURCE_LABELS = {
  existing: "Catalogue match",
  variation: "Known variation",
  original: "Original creation",
} as const;

type Props = {
  invention: MixologistInvention;
  onTryAgain?: () => void;
  onSave?: () => void;
  saved?: boolean;
  canSave?: boolean;
};

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="mixologist-metric">
      <p className="mixologist-metric-label">{label}</p>
      <p className="mixologist-metric-value">{value}</p>
    </div>
  );
}

export function MixologistResult({ invention, onTryAgain, onSave, saved, canSave }: Props) {
  const sourceLabel = SOURCE_LABELS[invention.source];

  return (
    <div className="mixologist-result animate-fade-in-up">
      <div className="mixologist-result-header">
        <div>
          <p className="eyebrow">
            {invention.aiPowered ? "AI original" : sourceLabel}
          </p>
          <h3 className="mixologist-result-title">{invention.name}</h3>
          <p className="mixologist-result-tagline">{invention.tagline}</p>
        </div>
        <div className="flex items-start gap-2">
          <ShareInventionButton invention={invention} compact className="h-11 w-11" />
          <div className="mixologist-confidence" aria-label={`Confidence ${invention.confidence} percent`}>
            <span className="mixologist-confidence-value">{invention.confidence}</span>
            <span className="mixologist-confidence-label">Confidence</span>
          </div>
        </div>
      </div>

      <div className="mixologist-metrics">
        <Metric label="Sweetness" value={capitalize(invention.sweetness)} />
        <Metric label="Strength" value={capitalize(invention.strength)} />
        <Metric label="Method" value={invention.method} />
        <Metric label="Glass" value={invention.glassware} />
      </div>

      <div className="mt-4">
        <FlavorTags flavors={invention.flavorProfile} />
      </div>

      {invention.notes && (
        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">{invention.notes}</p>
      )}

      <section className="mt-6">
        <h4 className="section-row-title">How to make it</h4>
        <ol className="mt-3 space-y-3">
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

      <section className="mt-6">
        <h4 className="section-row-title">Ingredients</h4>
        <ul className="mt-3 space-y-2">
          {invention.ingredients.map((item) => (
            <li key={`${item.ingredientId}-${item.amount}`} className="mixologist-recipe-row">
              <span className="text-sm text-[var(--foreground)]">
                {item.name}
                {item.substituted && item.originalName && (
                  <span className="text-[var(--muted)]"> · sub for {item.originalName}</span>
                )}
              </span>
              <span className="text-sm text-[var(--accent-dim)]">{item.amount}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-6 flex flex-col gap-3">
        {canSave && onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={saved}
            className="btn-primary w-full"
          >
            {saved ? "Saved to your originals" : "Save to CRAFT Originals"}
          </button>
        )}
        {invention.cocktailId && (
          <Link href={`/cocktails/${invention.cocktailId}`} className="btn-primary w-full text-center">
            View full recipe
          </Link>
        )}
        {onTryAgain && (
          <button type="button" onClick={onTryAgain} className="btn-secondary w-full">
            Invent another
          </button>
        )}
      </div>
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
