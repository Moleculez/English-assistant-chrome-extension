import type {
  AnalysisRequest,
  AnalysisResponse,
  LLMProvider,
  ProviderConfig,
} from "./types";
import { buildPrompt } from "./prompt-builder";
import { parseAnalysisResponse } from "../utils/response-parser";

const DEFAULT_OLLAMA_BASE = "http://localhost:11434";

export class OllamaProvider implements LLMProvider {
  readonly name = "Ollama";
  private readonly baseUrl: string;
  private readonly model: string;

  constructor(config: ProviderConfig) {
    this.baseUrl = (config.baseUrl ?? DEFAULT_OLLAMA_BASE).replace(/\/+$/, "");
    this.model = config.model;
  }

  async analyze(request: AnalysisRequest): Promise<AnalysisResponse> {
    const messages = buildPrompt(request);

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          format: "json",
          temperature: 0.3,
          max_tokens: 1024,
        }),
      });
    } catch (error) {
      throw new Error(
        `Cannot connect to Ollama at ${this.baseUrl}. Is Ollama running? (${error instanceof Error ? error.message : String(error)})`
      );
    }

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `Ollama request failed (${response.status}): ${body.slice(0, 200)}`
      );
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Ollama returned an empty response.");
    }

    return parseAnalysisResponse(content);
  }

  async listModels(): Promise<string[]> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/api/tags`);
    } catch (error) {
      throw new Error(
        `Cannot connect to Ollama at ${this.baseUrl}. Is Ollama running? (${error instanceof Error ? error.message : String(error)})`
      );
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch Ollama models (${response.status}).`);
    }

    const data = (await response.json()) as {
      models?: { name: string }[];
    };

    return (data.models ?? []).map((m) => m.name);
  }

  async validateConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }
}
