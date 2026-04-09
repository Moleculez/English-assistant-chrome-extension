import { AlertCircle, RefreshCw, Settings } from "lucide-react";
import { Card, CardContent } from "../../ui/components/card";
import { Button } from "../../ui/components/button";
import { openOptionsPage } from "../../lib/chrome-utils";

interface ErrorStateProps {
  message: string;
  retryable: boolean;
  onRetry: () => void;
}

export function ErrorState({ message, retryable, onRetry }: ErrorStateProps) {

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <Card className="w-full border-destructive/50">
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium">Something went wrong</p>
            <p className="text-xs text-muted-foreground">{message}</p>
          </div>

          <div className="flex gap-2">
            {retryable && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={onRetry}
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={openOptionsPage}
            >
              <Settings className="h-3 w-3" />
              Check settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
