import { useMemo } from "react";
import type { GlossaryEntry } from "../../lib/llm/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../ui/components/tooltip";

interface HighlightedTextProps {
  text: string;
  glossary: GlossaryEntry[];
}

interface TextSegment {
  text: string;
  entry: GlossaryEntry | null;
}

function buildSegments(text: string, glossary: GlossaryEntry[]): TextSegment[] {
  if (glossary.length === 0) {
    return [{ text, entry: null }];
  }

  // Sort terms by length descending so longer terms match first
  const sorted = [...glossary].sort(
    (a, b) => b.term.length - a.term.length,
  );

  // Build a case-insensitive regex matching any glossary term
  const escaped = sorted.map((e) =>
    e.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");

  const segments: TextSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const matchStart = match.index;
    if (matchStart > lastIndex) {
      segments.push({ text: text.slice(lastIndex, matchStart), entry: null });
    }

    const matched = match[0];
    const entry =
      sorted.find((e) => e.term.toLowerCase() === matched.toLowerCase()) ??
      null;

    segments.push({ text: matched, entry });
    lastIndex = matchStart + matched.length;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), entry: null });
  }

  return segments;
}

export function HighlightedText({ text, glossary }: HighlightedTextProps) {
  const segments = useMemo(() => buildSegments(text, glossary), [text, glossary]);

  return (
    <span>
      {segments.map((segment, i) => {
        if (!segment.entry) {
          return <span key={i}>{segment.text}</span>;
        }

        return (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <span className="cursor-help underline decoration-indigo-400 decoration-dotted underline-offset-2 text-indigo-700 dark:text-indigo-300">
                {segment.text}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[240px] text-xs">
              {segment.entry.meaning}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </span>
  );
}
