type Props = {
  value: "both" | "cocktails" | "mocktails";
  onChange: (value: "both" | "cocktails" | "mocktails") => void;
};

const OPTIONS: Array<{ id: "both" | "cocktails" | "mocktails"; label: string }> = [
  { id: "both", label: "Both" },
  { id: "cocktails", label: "Cocktails" },
  { id: "mocktails", label: "Mocktails" },
];

export function DrinkTypeFilter({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={`surprise-chip shrink-0 ${value === option.id ? "surprise-chip-active" : ""}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
