export type CEFRLevel = "A2" | "B1" | "B2";

export interface GlossaryEntry {
  term: string;
  meaning: string;
}

export interface AnalysisResponse {
  simplified: string;
  why: string;
  glossary: GlossaryEntry[];
  confidence: number;
}
