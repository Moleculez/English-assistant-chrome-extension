import type {
  AnalysisRequest,
  AnalysisResponse,
  LLMProvider,
  ProviderConfig,
} from "./types";
import { buildPrompt } from "./prompt-builder";
import { parseAnalysisResponse } from "../utils/response-parser";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

export class OpenRouterProvider implements LLMProvider {
  readonly name = "OpenRouter";
  private readonly apiKey: string;
  private readonly model: string;

  constructor(config: ProviderConfig) {
    if (!config.apiKey) {
      throw new Error("OpenRouter requires an API key.");
    }
    this.apiKey = config.apiKey;
    this.model = config.model;
  }

  async analyze(request: AnalysisRequest): Promise<AnalysisResponse> {
    const messages = buildPrompt(request);

    const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://easy-english-reader.extension",
        "X-Title": "Easy English Reader",
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    if (response.status === 401) {
      throw new Error("OpenRouter authentication failed. Check your API key.");
    }
    if (response.status === 429) {
      throw new Error("OpenRouter rate limit reached. Please wait and retry.");
    }
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `OpenRouter request failed (${response.status}): ${body.slice(0, 200)}`
      );
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("OpenRouter returned an empty response.");
    }

    return parseAnalysisResponse(content);
  }

  async listModels(): Promise<string[]> {
    const response = await fetch(`${OPENROUTER_BASE}/models`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch OpenRouter models (${response.status}).`);
    }

    const data = (await response.json()) as {
      data?: { id: string }[];
    };

    return (data.data ?? []).map((m) => m.id);
  }

  async validateConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${OPENROUTER_BASE}/models`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
