export type CEFRLevel = "A2" | "B1" | "B2";
export type ProviderType = "openrouter" | "ollama" | "custom";

export interface ProviderConfig {
  type: ProviderType;
  apiKey?: string;
  baseUrl?: string;
  model: string;
}
