import type { AnalysisRequest, CEFRLevel } from "./types";

const LEVEL_INSTRUCTIONS: Record<CEFRLevel, string> = {
  A2: [
    "Target: CEFR A2 (Elementary)",
    "- Use only the 1,000 most common English words",
    "- Maximum 8-10 words per sentence",
    "- Simple Subject-Verb-Object structure",
    "- No passive voice, no relative clauses",
    "- Replace idioms with literal meanings",
    "- Replace all pronouns with the nouns they refer to",
  ].join("\n"),
  B1: [
    "Target: CEFR B1 (Intermediate)",
    "- Use common everyday vocabulary (~3,000 most frequent words)",
    "- Clear, direct sentence structure",
    "- One idea per sentence",
    "- Explain idioms briefly in parentheses",
    "- Keep simple pronouns, clarify ambiguous ones",
    "- Use active voice when possible",
  ].join("\n"),
  B2: [
    "Target: CEFR B2 (Upper-Intermediate)",
    "- Preserve natural phrasing and tone",
    "- Only simplify genuinely complex or rare vocabulary",
    "- Keep the original sentence structure when it's clear enough",
    "- Briefly explain technical terms inline",
    "- Preserve nuance and hedging (may, might, could)",
  ].join("\n"),
};

function buildSystemPrompt(level: CEFRLevel): string {
  return `You are an ESL reading assistant that rewrites English text for language learners.

${LEVEL_INSTRUCTIONS[level]}

TASK:
1. Rewrite the selected text at the target level while preserving its exact meaning.
2. Use the surrounding context (paragraph, heading, nearby text) to correctly interpret pronouns, references, abbreviations, and implied subjects.
3. Identify 1-5 difficult words or phrases from the ORIGINAL text that a learner at this level likely does not know.

CONSTRAINTS:
- Never add information not present in the original.
- Never guess or hallucinate meanings — if unsure, keep the original phrasing.
- If the text contains an idiom or figurative expression, explain what it actually means.
- Keep important domain-specific terms but add a short definition in parentheses on first use.
- The simplified version must be a complete, natural-sounding sentence or paragraph — not bullet points or fragments.

OUTPUT FORMAT — respond with raw JSON only, no markdown fences:
{
  "simplified": "The rewritten text.",
  "why": "One sentence: what was hard about the original and what you changed.",
  "glossary": [{"term": "original word/phrase", "meaning": "simple definition"}],
  "confidence": 0.0-1.0
}

Glossary terms must come from the ORIGINAL text, not the simplified version.
Confidence: 1.0 = certain the simplification is accurate and meaning-preserving.`;
}

function buildUserPrompt(request: AnalysisRequest): string {
  const parts: string[] = [];

  if (request.pageTitle) {
    parts.push(`[Page: ${request.pageTitle}]`);
  }

  if (request.heading) {
    parts.push(`[Section: ${request.heading}]`);
  }

  const hasContext =
    request.leftContext || request.rightContext || request.paragraph;

  if (hasContext) {
    if (request.paragraph) {
      parts.push(`\nFull paragraph for context:\n${request.paragraph}`);
    } else {
      if (request.leftContext) {
        parts.push(`\nBefore: ...${request.leftContext}`);
      }
      if (request.rightContext) {
        parts.push(`After: ${request.rightContext}...`);
      }
    }
  } else if (request.sourceType === "pdf") {
    parts.push("\n(PDF document — no surrounding context available)");
  }

  parts.push(`\nSimplify this:\n"""${request.selectedText}"""`);

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
