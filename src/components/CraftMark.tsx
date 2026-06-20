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
      <svg viewBox="0 0 200 240" className="craft-mark-svg" fill="none" aria-hidden>
        <path
          d="M52 44 C52 44 100 28 148 44 L136 196 C136 204 128 210 100 210 C72 210 64 204 64 196 L52 44Z"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinejoin="round"
        />
        <path
          d="M64 196 H136"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M58 118 H142"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.35"
        />
      </svg>
    </span>
  );
}
