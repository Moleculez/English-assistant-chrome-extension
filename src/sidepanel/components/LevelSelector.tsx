import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../ui/components/tooltip";
import { cn } from "../../ui/cn";
import type { CEFRLevel } from "../../lib/llm/types";

interface LevelSelectorProps {
  currentLevel: CEFRLevel;
  onLevelChange: (level: CEFRLevel) => void;
}

const levels: { value: CEFRLevel; label: string; tip: string }[] = [
  { value: "A2", label: "A2", tip: "Easy — very simple words" },
  { value: "B1", label: "B1", tip: "Medium — everyday vocabulary" },
  { value: "B2", label: "B2", tip: "Precise — natural phrasing" },
];

export function LevelSelector({
  currentLevel,
  onLevelChange,
}: LevelSelectorProps) {
  return (
    <div
      className="inline-flex h-7 items-center rounded-md border bg-muted/40 p-0.5"
      role="radiogroup"
      aria-label="Reading level"
    >
      {levels.map(({ value, label, tip }) => (
        <Tooltip key={value}>
          <TooltipTrigger asChild>
            <button
              role="radio"
              aria-checked={currentLevel === value}
              onClick={() => onLevelChange(value)}
              className={cn(
                "inline-flex h-6 items-center justify-center rounded px-2 text-[11px] font-medium transition-colors",
                currentLevel === value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {tip}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
