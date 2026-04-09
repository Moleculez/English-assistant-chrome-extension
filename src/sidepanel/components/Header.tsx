import { BookOpen, Clock, Settings } from "lucide-react";
import { Button } from "../../ui/components/button";
import { Badge } from "../../ui/components/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../ui/components/tooltip";
import { cn } from "../../ui/cn";
import { openOptionsPage } from "../../lib/chrome-utils";
import type { CEFRLevel } from "../../lib/llm/types";
import { LevelSelector } from "./LevelSelector";

interface HeaderProps {
  currentLevel: CEFRLevel;
  onLevelChange: (level: CEFRLevel) => void;
  showHistory: boolean;
  onToggleHistory: () => void;
  isLoading?: boolean;
}

const levelBadgeColors: Record<CEFRLevel, string> = {
  A2: "bg-green-100 text-green-700 border-green-200",
  B1: "bg-indigo-100 text-indigo-700 border-indigo-200",
  B2: "bg-amber-100 text-amber-700 border-amber-200",
};

export function Header({
  currentLevel,
  onLevelChange,
  showHistory,
  onToggleHistory,
  isLoading,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <BookOpen
            className={cn("h-5 w-5 text-indigo-500", isLoading && "animate-pulse")}
          />
          <h1 className="text-sm font-bold tracking-tight">
            Easy English Reader
          </h1>
        </div>

        <div className="flex items-center gap-1.5">
          <Badge className={cn("text-[10px] px-1.5 py-0", levelBadgeColors[currentLevel])}>
            {currentLevel}
          </Badge>

          <LevelSelector
            currentLevel={currentLevel}
            onLevelChange={onLevelChange}
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showHistory ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={onToggleHistory}
                aria-label="Toggle history"
              >
                <Clock className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>History</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={openOptionsPage}
                aria-label="Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
