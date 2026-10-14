"use client";
import { BAR_TOOLS, getCocktailTools } from "@/lib/bar-tools";
import { useBarTools } from "@/hooks/use-bar-tools";
import type { Cocktail } from "@/lib/types";
export function BarToolsInventory() {
  const { toolIds, toggleTool } = useBarTools();
  return <section className="app-section">
    <h2 className="section-row-title">Bar tools</h2>
    <p className="section-row-subtitle">Select the equipment you own. Saved on this device.</p>
    <div className="mt-4 flex flex-wrap gap-2">{BAR_TOOLS.map(tool =>
      <button key={tool.id} type="button" aria-pressed={toolIds.includes(tool.id)} onClick={() => toggleTool(tool.id)}
        className={`min-h-11 rounded-full border px-4 py-2.5 text-sm ${toolIds.includes(tool.id) ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--border)] text-[var(--muted)]"}`}>
        {toolIds.includes(tool.id) ? "✓ " : ""}{tool.name}
      </button>)}</div>
  </section>;
}
export function CocktailTools({ cocktail }: { cocktail: Cocktail }) {
  const { toolIds } = useBarTools();
  return <section className="app-section">
    <h2 className="section-row-title">Equipment</h2>
    <p className="section-row-subtitle">For this preparation. Everyday alternatives work too.</p>
    <ul className="mt-4 space-y-3">{getCocktailTools(cocktail).map(tool => <li key={tool.id} className="rounded-xl border border-[var(--border)] px-4 py-3">
      <div className="flex items-center justify-between gap-3"><span>{tool.name}</span>
      <span className="text-xs text-[var(--muted)]">{toolIds.includes(tool.id) ? "Owned" : "Not in your tools"}</span></div>
      {!toolIds.includes(tool.id) && tool.alternative ? <p className="mt-1 text-sm text-[var(--muted)]">Alternative: {tool.alternative}</p> : null}
    </li>)}</ul>
  </section>;
}
