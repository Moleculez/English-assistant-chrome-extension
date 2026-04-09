import { useState } from "react";
import { Clock, Inbox, Trash2 } from "lucide-react";
import { Card, CardContent } from "../../ui/components/card";
import { Button } from "../../ui/components/button";
import { Badge } from "../../ui/components/badge";
import { Separator } from "../../ui/components/separator";
import { ScrollArea } from "../../ui/components/scroll-area";
import { cn } from "../../ui/cn";
import { truncateText } from "../../lib/utils/text";
import type { HistoryEntry } from "../../lib/storage/types";
import type { CEFRLevel } from "../../lib/llm/types";

interface HistoryListProps {
  history: HistoryEntry[];
  onRestore: (entry: HistoryEntry) => void;
  onClear: () => void;
}

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (hours < 48) return "yesterday";
  return `${Math.floor(hours / 24)} days ago`;
}

const levelColors: Record<CEFRLevel, string> = {
  A2: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  B1: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800",
  B2: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
};

export function HistoryList({ history, onRestore, onClear }: HistoryListProps) {
  const [confirmClear, setConfirmClear] = useState(false);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Inbox className="h-8 w-8 text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">No recent analyses</p>
      </div>
    );
  }

  const handleClear = () => {
    if (confirmClear) {
      onClear();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3">
        <h2 className="text-sm font-semibold">Recent Analyses</h2>
      </div>
      <Separator />

      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          {history.map((entry) => (
            <Card
              key={entry.id}
              className="cursor-pointer transition-colors duration-150 hover:bg-accent/50"
              onClick={() => onRestore(entry)}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs leading-relaxed">
                    {truncateText(entry.selectedText, 80)}
                  </p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] shrink-0",
                      levelColors[entry.level]
                    )}
                  >
                    {entry.level}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 mt-1.5 text-muted-foreground">
                  <Clock className="h-2.5 w-2.5" />
                  <p className="text-[10px]">
                    {formatRelativeTime(entry.timestamp)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <Separator />
      <div className="p-4">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full gap-1.5 text-xs",
            confirmClear
              ? "text-destructive hover:text-destructive"
              : "text-muted-foreground hover:text-destructive"
          )}
          onClick={handleClear}
          onBlur={() => setConfirmClear(false)}
        >
          <Trash2 className="h-3 w-3" />
          {confirmClear ? "Confirm clear?" : "Clear all"}
        </Button>
      </div>
    </div>
  );
}
