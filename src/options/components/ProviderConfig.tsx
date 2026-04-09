import { useState } from "react";
import type { ProviderConfig as ProviderConfigType, ProviderType } from "@/lib/llm/types";
import { Button } from "@/ui/components/button";
import { Input } from "@/ui/components/input";
import { Label } from "@/ui/components/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/card";
import { Separator } from "@/ui/components/separator";
import { ModelSelector } from "./ModelSelector";
import { Eye, EyeOff, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const PROVIDER_OPTIONS: Array<{ value: ProviderType; label: string; description: string }> = [
  {
    value: "openrouter",
    label: "OpenRouter",
    description: "Access many models via a single API key",
  },
  {
    value: "ollama",
    label: "Ollama (Local)",
    description: "Run models locally on your machine",
  },
  {
    value: "custom",
    label: "Custom Endpoint",
    description: "Use any OpenAI-compatible API",
  },
];

interface ProviderConfigProps {
  provider: ProviderConfigType;
  onChange: (provider: ProviderConfigType) => void;
}

export function ProviderConfig({ provider, onChange }: ProviderConfigProps) {
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [testMessage, setTestMessage] = useState("");

  const update = (patch: Partial<ProviderConfigType>) => {
    onChange({ ...provider, ...patch });
  };

  const handleTestConnection = async () => {
    setTestStatus("loading");
    setTestMessage("");
    try {
      if (provider.type === "ollama") {
        const url = provider.baseUrl || "http://localhost:11434";
        const res = await fetch(`${url}/api/tags`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setTestStatus("success");
        setTestMessage("Connected to Ollama successfully");
      } else if (provider.type === "openrouter") {
        if (!provider.apiKey) {
          setTestStatus("error");
          setTestMessage("API key is required");
          return;
        }
        const res = await fetch("https://openrouter.ai/api/v1/models", {
          headers: { Authorization: `Bearer ${provider.apiKey}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setTestStatus("success");
        setTestMessage("Connected to OpenRouter successfully");
      } else {
        if (!provider.baseUrl) {
          setTestStatus("error");
          setTestMessage("Base URL is required");
          return;
        }
        const res = await fetch(`${provider.baseUrl}/models`, {
          headers: provider.apiKey
            ? { Authorization: `Bearer ${provider.apiKey}` }
            : {},
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setTestStatus("success");
        setTestMessage("Connected successfully");
      }
    } catch (err) {
      setTestStatus("error");
      setTestMessage(
        err instanceof Error ? err.message : "Connection failed"
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">LLM Provider</CardTitle>
        <CardDescription>
          Choose how Easy English Reader connects to an AI model.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Provider</Label>
          <div className="grid gap-2">
            {PROVIDER_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                  provider.type === opt.value
                    ? "border-primary bg-primary/5"
                    : "border-input hover:bg-accent/50"
                }`}
              >
                <input
                  type="radio"
                  name="provider-type"
                  value={opt.value}
                  checked={provider.type === opt.value}
                  onChange={() =>
                    update({
                      type: opt.value,
                      model: opt.value === "openrouter" ? "openai/gpt-4o-mini" : "",
                      baseUrl:
                        opt.value === "ollama"
                          ? "http://localhost:11434"
                          : undefined,
                      apiKey: undefined,
                    })
                  }
                  className="mt-1 accent-[hsl(226,70%,55%)]"
                />
                <div>
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {opt.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          {(provider.type === "openrouter" || provider.type === "custom") && (
            <div className="space-y-2">
              <Label htmlFor="api-key">
                API Key{provider.type === "custom" ? " (optional)" : ""}
              </Label>
              <div className="relative">
                <Input
                  id="api-key"
                  type={showKey ? "text" : "password"}
                  placeholder={
                    provider.type === "openrouter"
                      ? "sk-or-..."
                      : "Enter API key"
                  }
                  value={provider.apiKey ?? ""}
                  onChange={(e) => update({ apiKey: e.target.value })}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showKey ? "Hide API key" : "Show API key"}
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {provider.type === "openrouter" && (
                <p className="text-xs text-muted-foreground">
                  Get your key at{" "}
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    openrouter.ai/keys
                  </a>
                </p>
              )}
            </div>
          )}

          {(provider.type === "ollama" || provider.type === "custom") && (
            <div className="space-y-2">
              <Label htmlFor="base-url">Base URL</Label>
              <Input
                id="base-url"
                placeholder={
                  provider.type === "ollama"
                    ? "http://localhost:11434"
                    : "https://api.example.com/v1"
                }
                value={provider.baseUrl ?? ""}
                onChange={(e) => update({ baseUrl: e.target.value })}
              />
              {provider.type === "ollama" && (
                <p className="text-xs text-muted-foreground">
                  Default Ollama address. Change only if using a custom port.
                </p>
              )}
            </div>
          )}

          <ModelSelector
            providerType={provider.type}
            model={provider.model}
            baseUrl={provider.baseUrl}
            onChange={(model) => update({ model })}
          />
        </div>

        <Separator />

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={testStatus === "loading"}
          >
            {testStatus === "loading" && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Test Connection
          </Button>
          {testStatus === "success" && (
            <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              {testMessage}
            </span>
          )}
          {testStatus === "error" && (
            <span className="flex items-center gap-1 text-sm text-destructive">
              <XCircle className="h-4 w-4" />
              {testMessage}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
