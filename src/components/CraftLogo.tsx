import Link from "next/link";
import { CRAFT_TAGLINE_UPPER } from "@/lib/brand";
import { CraftMark } from "./CraftMark";

export type CraftLogoVariant = "mark" | "wordmark" | "full" | "stacked";

type Props = {
  variant?: CraftLogoVariant;
  className?: string;
  href?: string | null;
  showTagline?: boolean;
};

export function CraftLogo({
  variant = "full",
  className = "",
  href = "/",
  showTagline = true,
}: Props) {
  const content =
    variant === "mark" ? (
      <CraftMark size="md" className={className} />
    ) : variant === "wordmark" ? (
      <span className={`craft-logo-wordmark ${className}`}>
        <span className="craft-logo-name">CRAFT</span>
        {showTagline && (
          <span className="craft-logo-tagline">{CRAFT_TAGLINE_UPPER}</span>
        )}
      </span>
    ) : variant === "stacked" ? (
      <span className={`craft-logo-stacked ${className}`}>
        <CraftMark size="lg" />
        <span className="craft-logo-name craft-logo-name-stacked">CRAFT</span>
        {showTagline && (
          <span className="craft-logo-tagline craft-logo-tagline-stacked">
            {CRAFT_TAGLINE_UPPER}
          </span>
        )}
      </span>
    ) : (
      <span className={`craft-logo-lockup ${className}`}>
        <CraftMark size="sm" />
        <span className="craft-logo-text">
          <span className="craft-logo-name">CRAFT</span>
          {showTagline && (
            <span className="craft-logo-tagline">{CRAFT_TAGLINE_UPPER}</span>
          )}
        </span>
      </span>
    );

  if (href === null) return content;

  return (
    <Link href={href} className="app-logo group">
      {content}
    </Link>
  );
}
