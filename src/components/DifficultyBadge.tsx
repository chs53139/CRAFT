import { Difficulty } from "@/lib/types";

const labels: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

const styles: Record<Difficulty, string> = {
  easy: "border-emerald-500/25 bg-emerald-500/8 text-emerald-300/90",
  medium: "border-amber-500/25 bg-amber-500/8 text-amber-300/90",
  hard: "border-rose-500/25 bg-rose-500/8 text-rose-300/90",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] ${styles[difficulty]}`}
    >
      {labels[difficulty]}
    </span>
  );
}
