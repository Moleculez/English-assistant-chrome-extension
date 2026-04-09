export type CEFRLevel = "A2" | "B1" | "B2";
export type ProviderType = "openrouter" | "ollama" | "custom";

export interface AnalysisRequest {
  selectedText: string;
  leftContext: string;
  rightContext: string;
  paragraph: string;
  heading: string;
  pageTitle: string;
  pageUrl: string;
  sourceType: "html" | "pdf";
  level: CEFRLevel;
}

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

export interface ProviderConfig {
  type: ProviderType;
  apiKey?: string;
  baseUrl?: string;
  model: string;
}

export interface LLMProvider {
  readonly name: string;
  analyze(request: AnalysisRequest): Promise<AnalysisResponse>;
  analyzeStream(
    request: AnalysisRequest,
    onToken: (token: string) => void,
  ): Promise<AnalysisResponse>;
  listModels?(): Promise<string[]>;
  validateConnection(): Promise<boolean>;
}
