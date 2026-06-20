import Link from "next/link";
import { CraftMark } from "./CraftMark";

export type CraftLogoVariant = "mark" | "wordmark" | "full";

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
    ) : (
      <span className={`craft-logo-lockup ${className}`}>
        <CraftMark size="sm" />
        <span className="craft-logo-text">
          <span className="craft-logo-name">CRAFT</span>
          {showTagline && (
            <span className="craft-logo-tagline">Your bar knows more than you think.</span>
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
