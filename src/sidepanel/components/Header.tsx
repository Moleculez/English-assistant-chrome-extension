import { BookOpen, Clock, Settings } from "lucide-react";
import { Button } from "../../ui/components/button";
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

export function Header({
  currentLevel,
  onLevelChange,
  showHistory,
  onToggleHistory,
  isLoading,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-1.5">
          <BookOpen
            className={cn("h-4 w-4 text-indigo-500", isLoading && "animate-pulse")}
          />
          <h1 className="text-xs font-semibold tracking-tight text-foreground">
            Easy English
          </h1>
        </div>

        <div className="flex items-center gap-1">
          <LevelSelector
            currentLevel={currentLevel}
            onLevelChange={onLevelChange}
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showHistory ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={onToggleHistory}
                aria-label="Toggle history"
              >
                <Clock className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>History</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={openOptionsPage}
                aria-label="Settings"
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
