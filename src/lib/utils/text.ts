export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 1) + "\u2026";
}

export function splitSentences(text: string): string[] {
  const matches = text.match(/[^.!?]+[.!?]+[\s]*/g);
  if (!matches) {
    return text.trim() ? [text.trim()] : [];
  }
  return matches.map((s) => s.trim()).filter(Boolean);
}

export function cleanWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}
