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

const levelLabels: Record<CEFRLevel, string> = {
  A2: "A2 Easy",
  B1: "B1 Medium",
  B2: "B2 Precise",
};

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
        {(Object.keys(levelLabels) as CEFRLevel[]).map((level) => (
          <SelectItem key={level} value={level} className="text-xs">
            {levelLabels[level]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
