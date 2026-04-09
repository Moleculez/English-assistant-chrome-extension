import { AlertCircle, RefreshCw, Settings, Shield, WifiOff } from "lucide-react";
import { Card, CardContent } from "../../ui/components/card";
import { Button } from "../../ui/components/button";
import { openOptionsPage } from "../../lib/chrome-utils";

interface ErrorStateProps {
  message: string;
  retryable: boolean;
  onRetry: () => void;
}

type ErrorCategory = "auth" | "network" | "cors" | "unknown";

function categorize(message: string): ErrorCategory {
  const lower = message.toLowerCase();
  if (
    lower.includes("api key") ||
    lower.includes("authentication") ||
    lower.includes("401")
  )
    return "auth";
  if (
    lower.includes("connect") ||
    lower.includes("network") ||
    lower.includes("fetch")
  )
    return "network";
  if (lower.includes("ollama_origins") || lower.includes("403")) return "cors";
  return "unknown";
}

const categoryConfig: Record<
  ErrorCategory,
  { icon: React.ReactNode; title: string; description?: string }
> = {
  auth: {
    icon: <Settings className="h-6 w-6 text-amber-500" />,
    title: "Provider not configured",
    description: "Add your API key or select a provider in Settings.",
  },
  network: {
    icon: <WifiOff className="h-6 w-6 text-blue-500" />,
    title: "Connection failed",
    description:
      "Check your internet connection. If using Ollama, make sure it is running.",
  },
  cors: {
    icon: <Shield className="h-6 w-6 text-orange-500" />,
    title: "CORS blocked by Ollama",
    description:
      "Run Ollama with: OLLAMA_ORIGINS=chrome-extension://* ollama serve",
  },
  unknown: {
    icon: <AlertCircle className="h-6 w-6 text-destructive" />,
    title: "Something went wrong",
  },
};

export function ErrorState({ message, retryable, onRetry }: ErrorStateProps) {
  const category = categorize(message);
  const config = categoryConfig[category];

  const borderColor =
    category === "auth"
      ? "border-amber-300/50 dark:border-amber-700/50"
      : category === "network"
        ? "border-blue-300/50 dark:border-blue-700/50"
        : category === "cors"
          ? "border-orange-300/50 dark:border-orange-700/50"
          : "border-destructive/50";

  const bgColor =
    category === "auth"
      ? "bg-amber-50/50 dark:bg-amber-950/30"
      : category === "network"
        ? "bg-blue-50/50 dark:bg-blue-950/30"
        : category === "cors"
          ? "bg-orange-50/50 dark:bg-orange-950/30"
          : "bg-destructive/5";

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <Card className={`w-full ${borderColor}`}>
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
          <div className={`rounded-full p-3 ${bgColor}`}>{config.icon}</div>

          <div className="space-y-1.5">
            <p className="text-sm font-medium">{config.title}</p>
            <p className="text-xs text-muted-foreground">
              {config.description ?? message}
            </p>
            {config.description && category !== "unknown" && (
              <p className="text-[11px] text-muted-foreground/70 mt-1 font-mono break-all">
                {message}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {retryable && (
              <Button
                variant="default"
                size="sm"
                className="gap-1.5"
                onClick={onRetry}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Try again
              </Button>
            )}
            {(category === "auth" || category === "unknown") && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={openOptionsPage}
              >
                <Settings className="h-3.5 w-3.5" />
                {category === "auth" ? "Set up in Settings" : "Check settings"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
