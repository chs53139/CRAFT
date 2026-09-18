import { isGenericDescription } from "@/lib/description-quality";

const HISTORICAL_SENTENCE_PATTERNS = [
  /\bcreated (by|at|in)\b/i,
  /\binvented (by|in|at)\b/i,
  /\bfirst (served|made|mixed|recorded)\b/i,
  /\boriginated (at|in|from)\b/i,
  /\bnamed after\b/i,
  /\bpopularized by\b/i,
  /\bcredited to\b/i,
  /\boften credited\b/i,
  /\bappears in\b/i,
  /\baccounts differ\b/i,
  /\bby the (18|19|20)\d{2}s\b/i,
  /\b(18|19|20)\d{2}\s*(Savoy|bar|hotel|club|cafe|café|Beachcomber|Waldorf)\b/i,
  /\bTrader Vic\b/i,
  /\bDonn Beach\b/i,
  /\bHarry Craddock\b/i,
  /\bSmuggler'?s Cove\b/i,
  /\bpublication\b/i,
  /\bhistorical\b/i,
  /\blegend\b/i,
  /\bnamed during\b/i,
];

export function normalizeCopyForComparison(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(text: string): Set<string> {
  const norm = normalizeCopyForComparison(text);
  return new Set(norm.split(" ").filter((t) => t.length > 2));
}

/** Obvious semantic duplication between subtitle and history (not AI). */
export function isMaterialDuplicateCopy(a: string, b: string): boolean {
  const left = a.trim();
  const right = b.trim();
  if (!left || !right) return false;

  const na = normalizeCopyForComparison(left);
  const nb = normalizeCopyForComparison(right);
  if (na === nb) return true;
  if (na.length > 20 && nb.length > 20 && (na.includes(nb) || nb.includes(na))) return true;

  const ta = tokenSet(left);
  const tb = tokenSet(right);
  if (ta.size === 0 || tb.size === 0) return false;
  let inter = 0;
  for (const t of ta) {
    if (tb.has(t)) inter += 1;
  }
  const union = ta.size + tb.size - inter;
  const jaccard = union > 0 ? inter / union : 0;
  if (jaccard >= 0.82 && Math.min(left.length, right.length) >= 24) return true;

  const yearsA: string[] = na.match(/\b(18|19|20)\d{2}\b/g) ?? [];
  const yearsB: string[] = nb.match(/\b(18|19|20)\d{2}\b/g) ?? [];
  const sharedYear = yearsA.some((y) => yearsB.includes(y));
  const provenanceCue = /\b(created|invented|served|credited|popularized|originated)\b/;
  if (
    sharedYear &&
    provenanceCue.test(na) &&
    provenanceCue.test(nb) &&
    jaccard >= 0.45
  ) {
    return true;
  }

  return false;
}

export function isHistoricalProvenanceSentence(sentence: string): boolean {
  const s = sentence.trim();
  if (!s) return false;
  return HISTORICAL_SENTENCE_PATTERNS.some((p) => p.test(s));
}

function splitSentences(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  return trimmed.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((s) => s.trim()) ?? [trimmed];
}

/**
 * Optional subtitle: flavor/character sentences only — never duplicate history block.
 */
export function extractFlavorSubtitleFromFunFact(funFact: string | undefined): string {
  if (!funFact?.trim()) return "";
  const sentences = splitSentences(funFact);
  const flavor = sentences.filter((s) => !isHistoricalProvenanceSentence(s));
  if (flavor.length === 0) return "";

  const lead = flavor.slice(0, 2).join(" ").trim();
  const historyOnly = sentences.filter((s) => isHistoricalProvenanceSentence(s)).join(" ").trim();
  if (lead.length < 20 || isGenericDescription(lead)) return "";
  if (historyOnly && isMaterialDuplicateCopy(lead, historyOnly)) return "";

  const maxLen = 220;
  return lead.length > maxLen ? `${lead.slice(0, maxLen - 1)}…` : lead;
}

export function getCocktailDisplaySubtitle(description: string, funFact: string): string {
  const desc = description.trim();
  if (!desc) return "";
  if (isHistoricalProvenanceSentence(desc)) return "";
  const historyOnly = splitSentences(funFact)
    .filter((s) => isHistoricalProvenanceSentence(s))
    .join(" ")
    .trim();
  if (historyOnly && isMaterialDuplicateCopy(desc, historyOnly)) return "";
  if (!historyOnly && isMaterialDuplicateCopy(desc, funFact)) return "";
  return desc;
}

/** History block with sentences already shown in subtitle removed. */
export function getHistoryDisplayText(funFact: string, subtitle: string): string {
  const fact = funFact.trim();
  if (!fact) return "";
  const sub = subtitle.trim();
  if (!sub) return fact;

  const kept = splitSentences(fact).filter((sentence) => {
    if (isMaterialDuplicateCopy(sentence, sub)) return false;
    const sn = normalizeCopyForComparison(sentence);
    const subn = normalizeCopyForComparison(sub);
    if (sn && subn.includes(sn)) return false;
    return true;
  });
  return kept.join(" ").trim() || fact;
}

export type CopyHierarchyAuditRow = {
  slug: string;
  hadDescription: boolean;
  duplicated: boolean;
  subtitleNow: string;
};

export function auditCatalogueCopyHierarchy(
  rows: Array<{ id: string; description: string; funFact: string }>
): {
  beforeDuplicates: number;
  blankSubtitle: number;
  distinctSubtitle: number;
  rows: CopyHierarchyAuditRow[];
} {
  let beforeDuplicates = 0;
  let blankSubtitle = 0;
  let distinctSubtitle = 0;
  const auditRows: CopyHierarchyAuditRow[] = [];

  for (const row of rows) {
    const had = row.description.trim().length > 0;
    const dup =
      had && (isMaterialDuplicateCopy(row.description, row.funFact) || isHistoricalProvenanceSentence(row.description));
    if (dup) beforeDuplicates += 1;

    const subtitleNow = getCocktailDisplaySubtitle(row.description, row.funFact);
    if (!subtitleNow) blankSubtitle += 1;
    else distinctSubtitle += 1;

    auditRows.push({
      slug: row.id,
      hadDescription: had,
      duplicated: dup,
      subtitleNow,
    });
  }

  return { beforeDuplicates, blankSubtitle, distinctSubtitle, rows: auditRows };
}
