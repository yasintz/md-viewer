/**
 * Normalizes text by collapsing whitespace for comparison
 */
export function normalizeText(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

