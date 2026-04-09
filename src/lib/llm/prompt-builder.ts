import type { AnalysisRequest, CEFRLevel } from "./types";

const LEVEL_DESCRIPTIONS: Record<CEFRLevel, string> = {
  A2: "Very simple words, short sentences, basic vocabulary. Use only the most common everyday words. Keep sentences under 10 words where possible.",
  B1: "Common everyday vocabulary, clear sentence structure. Use straightforward language that an intermediate learner can follow.",
  B2: "Natural phrasing, simplify only truly complex elements. Keep the tone natural but clarify advanced vocabulary or dense constructions.",
};

function buildSystemPrompt(level: CEFRLevel): string {
  return [
    "You are an ESL reading assistant. Your job is to rewrite selected text in easy English at a specific CEFR level.",
    "",
    `Target level: ${level} - ${LEVEL_DESCRIPTIONS[level]}`,
    "",
    "Rules:",
    "- Preserve the factual meaning of the original text exactly.",
    "- Explain idioms and figurative language in plain terms.",
    "- Keep important domain terms but add brief parenthetical definitions.",
    "- Use the surrounding context to resolve pronouns, references, and abbreviations.",
    "- Do NOT add information that is not in the original text.",
    "- Do NOT hallucinate facts or meanings.",
    "",
    "Respond with valid JSON only (no markdown, no code fences):",
    "{",
    '  "simplified": "The rewritten text in easy English.",',
    '  "why": "A one-sentence explanation of what was changed and why.",',
    '  "glossary": [{"term": "...", "meaning": "..."}],',
    '  "confidence": 0.0 to 1.0',
    "}",
    "",
    "Glossary: include 1-5 key terms from the original that a learner at this level might not know.",
    "Confidence: how certain you are that your simplification is accurate (1.0 = very certain).",
  ].join("\n");
}

function buildUserPrompt(request: AnalysisRequest): string {
  const parts: string[] = [];

  parts.push(`Page: ${request.pageTitle}`);

  if (request.heading) {
    parts.push(`Section heading: ${request.heading}`);
  }

  const hasSurroundingContext =
    request.leftContext || request.rightContext || request.paragraph;

  if (request.sourceType === "pdf" && !hasSurroundingContext) {
    parts.push(
      "Note: This text comes from a PDF. No surrounding context is available."
    );
  } else {
    if (request.paragraph) {
      parts.push(`Full paragraph: ${request.paragraph}`);
    }
    if (request.leftContext) {
      parts.push(`Text before selection: ${request.leftContext}`);
    }
    if (request.rightContext) {
      parts.push(`Text after selection: ${request.rightContext}`);
    }
  }

  parts.push("");
  parts.push(`Selected text to simplify:\n"${request.selectedText}"`);

  return parts.join("\n");
}

export function buildPrompt(
  request: AnalysisRequest
): { role: string; content: string }[] {
  return [
    { role: "system", content: buildSystemPrompt(request.level) },
    { role: "user", content: buildUserPrompt(request) },
  ];
}
