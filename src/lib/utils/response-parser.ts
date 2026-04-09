import { z } from "zod";
import type { AnalysisResponse } from "../llm/types";

const GlossaryEntrySchema = z.object({
  term: z.string(),
  meaning: z.string(),
});

const AnalysisResponseSchema = z.object({
  simplified: z.string(),
  why: z.string(),
  glossary: z.array(GlossaryEntrySchema),
  confidence: z.number().min(0).max(1),
});

function extractJsonFromText(raw: string): string {
  // Try to find JSON inside markdown code fences
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }

  // Try to find a JSON object in the raw text
  const braceStart = raw.indexOf("{");
  const braceEnd = raw.lastIndexOf("}");
  if (braceStart !== -1 && braceEnd > braceStart) {
    return raw.slice(braceStart, braceEnd + 1);
  }

  return raw.trim();
}

export function parseAnalysisResponse(raw: string): AnalysisResponse {
  const jsonText = extractJsonFromText(raw);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error(
      `Failed to parse LLM response as JSON. Raw response: ${raw.slice(0, 200)}`
    );
  }

  const result = AnalysisResponseSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`LLM response validation failed: ${issues}`);
  }

  return result.data;
}
