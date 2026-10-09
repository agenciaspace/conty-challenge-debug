export function normalizeKey(key: string): string {
  // The incident contains both trailing whitespace and an invisible U+200B.
  return key.replace(/[\s\u200B\uFEFF]+$/u, "").trimStart().toLowerCase();
}
