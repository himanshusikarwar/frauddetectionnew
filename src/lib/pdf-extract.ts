/**
 * Heuristic extraction of topic-like lines from PDF text.
 * Looks for: short lines, title case, "Chapter N", "Unit N", numbered lines, etc.
 */
export function extractTopicsFromText(text: string): string[] {
  if (!text || !text.trim()) return [];

  const lines = text
    .split(/\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && line.length < 120);

  const result: string[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    let cleaned = line
      .replace(/^[\s\-*•·]\s*/, "")
      .replace(/^\d+[.)]\s*/, "")
      .replace(/^(Chapter|Unit|Topic|Part)\s*\d*\s*[.:\-]\s*/i, "")
      .trim();
    if (cleaned.length < 2) continue;
    if (seen.has(cleaned.toLowerCase())) continue;
    seen.add(cleaned.toLowerCase());
    result.push(cleaned);
  }

  if (result.length === 0) {
    const fallback = text
      .split(/\n/)
      .map((l) => l.trim().replace(/^[\s\-*•·\d.)]+\s*/, ""))
      .filter((l) => l.length > 2 && l.length < 150);
    return [...new Set(fallback)];
  }

  return result;
}
