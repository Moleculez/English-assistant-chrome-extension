import { BookOpen, Clock, Settings } from "lucide-react";
import { Button } from "../../ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../ui/components/tooltip";
import { Separator } from "../../ui/components/separator";
import { openOptionsPage } from "../../lib/chrome-utils";
import type { CEFRLevel } from "../../lib/llm/types";
import { LevelSelector } from "./LevelSelector";

interface HeaderProps {
  currentLevel: CEFRLevel;
  onLevelChange: (level: CEFRLevel) => void;
  showHistory: boolean;
  onToggleHistory: () => void;
}

export function Header({
  currentLevel,
  onLevelChange,
  showHistory,
  onToggleHistory,
}: HeaderProps) {

  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-500" />
          <h1 className="text-sm font-semibold tracking-tight">
            Easy English Reader
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
      <Separator />
    </header>
  );
}
