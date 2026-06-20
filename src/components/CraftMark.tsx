type Props = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES = {
  sm: "craft-mark-sm",
  md: "craft-mark-md",
  lg: "craft-mark-lg",
} as const;

export function CraftMark({ size = "md", className = "" }: Props) {
  return (
    <span className={`craft-mark ${SIZES[size]} ${className}`} aria-hidden>
      <span className="craft-mark-letter">C</span>
    </span>
  );
}
