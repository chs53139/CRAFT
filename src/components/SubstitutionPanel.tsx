import { AppliedSubstitution, HomemadeAlternative } from "@/lib/substitutions/types";

type Props = {
  substitutions: AppliedSubstitution[];
  homemadeSuggestions?: HomemadeAlternative[];
  compact?: boolean;
};

export function SubstitutionPanel({
  substitutions,
  homemadeSuggestions = [],
  compact,
}: Props) {
  const unresolvedHomemade = homemadeSuggestions.filter(
    (item) => !substitutions.some((sub) => sub.requiredId === item.ingredientId)
  );

  if (substitutions.length === 0 && unresolvedHomemade.length === 0) return null;

  return (
    <div className={`substitution-panel ${compact ? "substitution-panel-compact" : ""}`}>
      {substitutions.length > 0 && (
        <>
          <p className="substitution-panel-title">Substitutions used</p>
          <p className="substitution-panel-copy">
            These aren&apos;t identical swaps — flavor and balance will shift.
          </p>
          <ul className="substitution-list">
            {substitutions.map((sub) => (
              <li key={`${sub.requiredId}-${sub.substituteId}`} className="substitution-item">
                <div className="substitution-item-header">
                  <p className="substitution-item-swap">
                    {sub.requiredName}
                    <span className="substitution-arrow">→</span>
                    {sub.substituteName}
                  </p>
                  <span className="substitution-confidence">{sub.confidence}%</span>
                </div>
                <p className="substitution-impact">{sub.flavorImpact}</p>
                <p className="substitution-notes">{sub.notes}</p>
                {sub.isHomemade && sub.homemadeInstructions && (
                  <ol className="substitution-homemade-steps">
                    {sub.homemadeInstructions.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {unresolvedHomemade.length > 0 && (
        <>
          <p className="substitution-panel-title mt-4">Make at home</p>
          <p className="substitution-panel-copy">
            Pantry substitutes when you don&apos;t have the bottle — expect a different drink.
          </p>
          <ul className="substitution-list">
            {unresolvedHomemade.map((item) => (
              <li key={item.ingredientId} className="substitution-item">
                <div className="substitution-item-header">
                  <p className="substitution-item-swap">{item.name}</p>
                  <span className="substitution-confidence">{item.confidence}%</span>
                </div>
                <p className="substitution-impact">{item.flavorImpact}</p>
                <p className="substitution-notes">{item.notes}</p>
                <ol className="substitution-homemade-steps">
                  {item.instructions.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
