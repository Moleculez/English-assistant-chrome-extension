import type {
  AnalysisRequest,
  AnalysisResponse,
  LLMProvider,
  ProviderConfig,
} from "./types";
import { buildPrompt } from "./prompt-builder";
import { readSSEStream } from "./stream-reader";
import { parseAnalysisResponse } from "../utils/response-parser";

export class CustomOpenAIProvider implements LLMProvider {
  readonly name = "Custom OpenAI-compatible";
  private readonly baseUrl: string;
  private readonly apiKey: string | undefined;
  private readonly model: string;

  constructor(config: ProviderConfig) {
    if (!config.baseUrl) {
      throw new Error("Custom provider requires a baseUrl.");
    }
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.apiKey = config.apiKey;
    this.model = config.model;
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.apiKey) {
      h["Authorization"] = `Bearer ${this.apiKey}`;
    }
    return h;
  }

  async analyze(request: AnalysisRequest): Promise<AnalysisResponse> {
    const messages = buildPrompt(request);

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({
          model: this.model,
          messages,
          response_format: { type: "json_object" },
          temperature: 0.3,
          max_tokens: 1024,
        }),
      });
    } catch (error) {
      throw new Error(
        `Cannot connect to ${this.baseUrl}. (${error instanceof Error ? error.message : String(error)})`
      );
    }

    if (response.status === 401) {
      throw new Error("Authentication failed. Check your API key.");
    }
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `Request failed (${response.status}): ${body.slice(0, 200)}`
      );
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Provider returned an empty response.");
    }

    return parseAnalysisResponse(content);
  }

  async analyzeStream(
    request: AnalysisRequest,
    onToken: (token: string) => void,
  ): Promise<AnalysisResponse> {
    const messages = buildPrompt(request);

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({
          model: this.model,
          messages,
          stream: true,
          temperature: 0.3,
          max_tokens: 1024,
        }),
      });
    } catch (error) {
      throw new Error(
        `Cannot connect to ${this.baseUrl}. (${error instanceof Error ? error.message : String(error)})`,
      );
    }

    if (response.status === 401) {
      throw new Error("Authentication failed. Check your API key.");
    }
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `Request failed (${response.status}): ${body.slice(0, 200)}`,
      );
    }

    if (!response.body) {
      throw new Error("Provider returned no response body for streaming.");
    }

    const accumulated = await readSSEStream(response.body, onToken);
    return parseAnalysisResponse(accumulated);
  }

  async listModels(): Promise<string[]> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/v1/models`, {
        headers: this.headers(),
      });
    } catch (error) {
      throw new Error(
        `Cannot connect to ${this.baseUrl}. (${error instanceof Error ? error.message : String(error)})`
      );
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch models (${response.status}).`);
    }

    const data = (await response.json()) as {
      data?: { id: string }[];
    };

    return (data.data ?? []).map((m) => m.id);
  }

  async validateConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/models`, {
        headers: this.headers(),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
