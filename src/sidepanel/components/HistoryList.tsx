import { Trash2 } from "lucide-react";
import { Card, CardContent } from "../../ui/components/card";
import { Button } from "../../ui/components/button";
import { Badge } from "../../ui/components/badge";
import { Separator } from "../../ui/components/separator";
import { ScrollArea } from "../../ui/components/scroll-area";
import type { HistoryEntry } from "../../lib/storage/types";

interface HistoryListProps {
  history: HistoryEntry[];
  onRestore: (entry: HistoryEntry) => void;
  onClear: () => void;
}

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function HistoryList({ history, onRestore, onClear }: HistoryListProps) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-sm text-muted-foreground">No history yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Analyzed texts will appear here
        </p>
      </div>
    );
  }

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
                  <p className="text-xs leading-relaxed line-clamp-2">
                    {entry.selectedText}
                  </p>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    {entry.level}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  {formatRelativeTime(entry.timestamp)}
                </p>
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
          className="w-full gap-1.5 text-xs text-muted-foreground hover:text-destructive"
          onClick={onClear}
        >
          <Trash2 className="h-3 w-3" />
          Clear history
        </Button>
      </div>
    </div>
  );
}
