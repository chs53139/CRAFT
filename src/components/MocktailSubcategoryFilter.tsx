import { MOCKTAIL_SUBCATEGORIES, MOCKTAIL_SUBCATEGORY_LABELS } from "@/lib/mocktail-curation";
import { MocktailSubcategory } from "@/lib/types";

type Props = {
  value: MocktailSubcategory | "all";
  onChange: (value: MocktailSubcategory | "all") => void;
};

export function MocktailSubcategoryFilter({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button
        type="button"
        onClick={() => onChange("all")}
        className={`surprise-chip shrink-0 ${value === "all" ? "surprise-chip-active" : ""}`}
      >
        All styles
      </button>
      {MOCKTAIL_SUBCATEGORIES.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`surprise-chip shrink-0 ${value === id ? "surprise-chip-active" : ""}`}
        >
          {MOCKTAIL_SUBCATEGORY_LABELS[id]}
        </button>
      ))}
    </div>
  );
}
