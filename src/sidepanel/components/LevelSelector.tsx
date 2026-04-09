import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/components/select";
import type { CEFRLevel } from "../../lib/llm/types";

interface LevelSelectorProps {
  currentLevel: CEFRLevel;
  onLevelChange: (level: CEFRLevel) => void;
}

const levels: { value: CEFRLevel; label: string; description: string }[] = [
  { value: "A2", label: "A2 — Easy", description: "Very simple words and short sentences" },
  { value: "B1", label: "B1 — Medium", description: "Common everyday vocabulary" },
  { value: "B2", label: "B2 — Precise", description: "Natural phrasing, minimal changes" },
];

export function LevelSelector({
  currentLevel,
  onLevelChange,
}: LevelSelectorProps) {
  return (
    <Select
      value={currentLevel}
      onValueChange={(value) => onLevelChange(value as CEFRLevel)}
    >
      <SelectTrigger className="h-7 w-[52px] gap-1 px-2 text-xs font-medium" aria-label="CEFR Level">
        <SelectValue placeholder="Level" />
      </SelectTrigger>
      <SelectContent align="end">
        {levels.map(({ value, label, description }) => (
          <SelectItem key={value} value={value} className="py-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium">{label}</span>
              <span className="text-[10px] leading-tight text-muted-foreground">{description}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
