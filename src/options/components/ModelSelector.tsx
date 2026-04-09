import { useCallback, useEffect, useState } from "react";
import type { ProviderType } from "@/lib/llm/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/select";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import { Loader2 } from "lucide-react";

const OPENROUTER_MODELS = [
  { id: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
  { id: "openai/gpt-4o", label: "GPT-4o" },
  { id: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
  { id: "anthropic/claude-3-haiku", label: "Claude 3 Haiku" },
  { id: "google/gemini-pro", label: "Gemini Pro" },
  { id: "google/gemini-flash-1.5", label: "Gemini Flash 1.5" },
  { id: "meta-llama/llama-3.1-8b-instruct", label: "Llama 3.1 8B" },
  { id: "mistralai/mistral-7b-instruct", label: "Mistral 7B" },
];

interface ModelSelectorProps {
  providerType: ProviderType;
  model: string;
  baseUrl?: string;
  onChange: (model: string) => void;
}

export function ModelSelector({
  providerType,
  model,
  baseUrl,
  onChange,
}: ModelSelectorProps) {
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customModel, setCustomModel] = useState("");

  const fetchOllamaModels = useCallback(async (url: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${url}/api/tags`);
      if (!response.ok) throw new Error("Failed to fetch models");
      const data = (await response.json()) as {
        models: Array<{ name: string }>;
      };
      const models = data.models.map((m) => m.name);
      setOllamaModels(models);
    } catch {
      setError("Could not fetch models from Ollama");
      setOllamaModels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (providerType === "ollama" && baseUrl) {
      fetchOllamaModels(baseUrl);
    }
  }, [providerType, baseUrl, fetchOllamaModels]);

  if (providerType === "openrouter") {
    const isCustom = !OPENROUTER_MODELS.some((m) => m.id === model);
    return (
      <div className="space-y-2">
        <Label>Model</Label>
        <Select
          value={isCustom ? "__custom__" : model}
          onValueChange={(value) => {
            if (value === "__custom__") {
              setCustomModel(model);
            } else {
              onChange(value);
              setCustomModel("");
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {OPENROUTER_MODELS.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.label}
              </SelectItem>
            ))}
            <SelectItem value="__custom__">Custom model ID...</SelectItem>
          </SelectContent>
        </Select>
        {(isCustom || customModel !== "") && (
          <Input
            placeholder="e.g. openai/gpt-4-turbo"
            value={isCustom ? model : customModel}
            onChange={(e) => {
              setCustomModel(e.target.value);
              onChange(e.target.value);
            }}
          />
        )}
      </div>
    );
  }

  if (providerType === "ollama") {
    return (
      <div className="space-y-2">
        <Label>Model</Label>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Fetching models...
          </div>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && ollamaModels.length > 0 && (
          <Select value={model} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {ollamaModels.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {!loading && ollamaModels.length === 0 && !error && (
          <Input
            placeholder="e.g. llama3.1"
            value={model}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Model Name</Label>
      <Input
        placeholder="e.g. gpt-4o-mini"
        value={model}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-xs text-muted-foreground">
        Enter the model identifier used by your endpoint.
      </p>
    </div>
  );
}
