"use client";

import {
  CATEGORY_FILTER_OPTIONS,
  DEFAULT_DISCOVERY_FILTERS,
  DIFFICULTY_FILTER_OPTIONS,
  DiscoveryFilters,
  DiscoverySort,
  FLAVOR_FILTER_OPTIONS,
  hasActiveDiscoveryFilters,
  RARITY_FILTER_OPTIONS,
  SORT_OPTIONS,
  SPIRIT_FILTER_OPTIONS,
  STRENGTH_FILTER_OPTIONS,
} from "@/lib/discovery-filters";

type Props = {
  filters: DiscoveryFilters;
  sort: DiscoverySort;
  onFiltersChange: (filters: DiscoveryFilters) => void;
  onSortChange: (sort: DiscoverySort) => void;
  showCraftOriginals?: boolean;
  compact?: boolean;
};

function FilterChipRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ id: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="discovery-filter-label">{label}</p>
      <div className="discovery-filter-chips">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`surprise-chip shrink-0 ${value === option.id ? "surprise-chip-active" : ""}`}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DiscoveryFilterPanel({
  filters,
  sort,
  onFiltersChange,
  onSortChange,
  showCraftOriginals = true,
  compact = false,
}: Props) {
  const update = <K extends keyof DiscoveryFilters>(key: K, value: DiscoveryFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const active = hasActiveDiscoveryFilters(filters);

  return (
    <div className="discovery-filter-panel space-y-4">
      <div className="flex items-center justify-between gap-3">
        <label className="discovery-sort-select">
          <span className="sr-only">Sort by</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as DiscoverySort)}
            className="discovery-sort-input"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {active && (
          <button
            type="button"
            className="text-xs font-semibold text-[var(--accent)]"
            onClick={() => onFiltersChange(DEFAULT_DISCOVERY_FILTERS)}
          >
            Clear filters
          </button>
        )}
      </div>

      {!compact && (
        <>
          <FilterChipRow
            label="Spirit"
            options={SPIRIT_FILTER_OPTIONS}
            value={filters.spirit}
            onChange={(value) => update("spirit", value)}
          />

          <FilterChipRow
            label="Category"
            options={CATEGORY_FILTER_OPTIONS}
            value={filters.category}
            onChange={(value) => update("category", value)}
          />
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FilterChipRow
          label="Difficulty"
          options={DIFFICULTY_FILTER_OPTIONS}
          value={filters.difficulty}
          onChange={(value) => update("difficulty", value)}
        />

        <FilterChipRow
          label="Flavor"
          options={FLAVOR_FILTER_OPTIONS}
          value={filters.flavor}
          onChange={(value) => update("flavor", value)}
        />

        <FilterChipRow
          label="Strength"
          options={STRENGTH_FILTER_OPTIONS}
          value={filters.strength}
          onChange={(value) => update("strength", value)}
        />

        <FilterChipRow
          label="Rarity"
          options={RARITY_FILTER_OPTIONS}
          value={filters.rarity}
          onChange={(value) => update("rarity", value)}
        />
      </div>

      {showCraftOriginals && (
        <label className="discovery-toggle-row">
          <input
            type="checkbox"
            checked={filters.craftOriginals}
            onChange={(e) => update("craftOriginals", e.target.checked)}
            className="discovery-toggle-checkbox"
          />
          <span>CRAFT Originals only</span>
        </label>
      )}
    </div>
  );
}

export function DiscoveryFilterToggle({
  expanded,
  onToggle,
  activeCount,
}: {
  expanded: boolean;
  onToggle: () => void;
  activeCount?: number;
}) {
  return (
    <button
      type="button"
      className="discovery-filter-toggle"
      onClick={onToggle}
    >
      {expanded ? "Hide filters" : "Filters & sort"}
      {activeCount != null && activeCount > 0 && (
        <span className="discovery-filter-badge">{activeCount}</span>
      )}
    </button>
  );
}
