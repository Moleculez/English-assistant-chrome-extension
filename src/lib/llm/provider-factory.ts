import { OpenRouterProvider } from "./openrouter";
import { OllamaProvider } from "./ollama";
import { CustomOpenAIProvider } from "./custom-openai";
import type { ProviderConfig, LLMProvider } from "./types";

export function createProvider(config: ProviderConfig): LLMProvider {
  switch (config.type) {
    case "openrouter":
      return new OpenRouterProvider(config);
    case "ollama":
      return new OllamaProvider(config);
    case "custom":
      return new CustomOpenAIProvider(config);
    default:
      throw new Error(`Unknown provider: ${(config as { type: string }).type}`);
  }
}
