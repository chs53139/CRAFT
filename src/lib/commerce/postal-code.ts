/** Reasonable US ZIP / postal validation (5 digits or ZIP+4). */
export function isValidPostalCode(input: string): boolean {
  const trimmed = input.trim();
  return /^\d{5}(-\d{4})?$/.test(trimmed);
}

export function normalizePostalCode(input: string): string {
  return input.trim();
}
