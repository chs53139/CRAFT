"use client";

import {
  SUBSTITUTION_MODE_LABELS,
  SubstitutionMode,
} from "@/lib/substitution-display";

const MODES: SubstitutionMode[] = [
  "exact-only",
  "include-substitutions",
  "experimental-allowed",
];

type Props = {
  value: SubstitutionMode;
  onChange: (value: SubstitutionMode) => void;
};

export function SubstitutionModeFilter({ value, onChange }: Props) {
  return (
    <div className="substitution-mode-filter">
      {MODES.map((mode) => (
        <button
          key={mode}
          type="button"
          className={`substitution-mode-chip ${value === mode ? "substitution-mode-chip-active" : ""}`}
          onClick={() => onChange(mode)}
        >
          {SUBSTITUTION_MODE_LABELS[mode]}
        </button>
      ))}
    </div>
  );
}
