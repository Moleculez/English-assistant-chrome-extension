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
  { value: "A2", label: "A2 Easy", description: "Very simple words and short sentences" },
  { value: "B1", label: "B1 Medium", description: "Common everyday vocabulary and clear structure" },
  { value: "B2", label: "B2 Precise", description: "Natural phrasing, only complex parts simplified" },
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
      <SelectTrigger className="h-8 w-[120px] text-xs" aria-label="CEFR Level">
        <SelectValue placeholder="Level" />
      </SelectTrigger>
      <SelectContent>
        {levels.map(({ value, label, description }) => (
          <SelectItem key={value} value={value} className="py-2 text-xs">
            <div className="flex flex-col gap-0.5">
              <span>{label}</span>
              <span className="text-[10px] text-muted-foreground">{description}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
