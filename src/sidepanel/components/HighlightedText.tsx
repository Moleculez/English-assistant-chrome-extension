import { useMemo } from "react";
import type { GlossaryEntry } from "../../lib/llm/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../ui/components/tooltip";
import { cn } from "../../ui/cn";

interface HighlightedTextProps {
  text: string;
  glossary: GlossaryEntry[];
  activeWordIndex?: number;
}

interface TextSegment {
  text: string;
  entry: GlossaryEntry | null;
  wordStartIndex: number;
  wordEndIndex: number;
}

function buildSegments(text: string, glossary: GlossaryEntry[]): TextSegment[] {
  if (glossary.length === 0) {
    return [{ text, entry: null, wordStartIndex: 0, wordEndIndex: text.split(/\s+/).filter(Boolean).length - 1 }];
  }

  const sorted = [...glossary].sort(
    (a, b) => b.term.length - a.term.length,
  );

  const escaped = sorted.map((e) =>
    e.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");

  const segments: TextSegment[] = [];
  let lastIndex = 0;
  let wordCounter = 0;

  for (const match of text.matchAll(pattern)) {
    const matchStart = match.index;
    if (matchStart > lastIndex) {
      const chunk = text.slice(lastIndex, matchStart);
      const chunkWords = chunk.split(/\s+/).filter(Boolean).length;
      segments.push({ text: chunk, entry: null, wordStartIndex: wordCounter, wordEndIndex: wordCounter + chunkWords - 1 });
      wordCounter += chunkWords;
    }

    const matched = match[0];
    const entry =
      sorted.find((e) => e.term.toLowerCase() === matched.toLowerCase()) ?? null;
    const matchWords = matched.split(/\s+/).filter(Boolean).length;

    segments.push({ text: matched, entry, wordStartIndex: wordCounter, wordEndIndex: wordCounter + matchWords - 1 });
    wordCounter += matchWords;
    lastIndex = matchStart + matched.length;
  }

  if (lastIndex < text.length) {
    const chunk = text.slice(lastIndex);
    const chunkWords = chunk.split(/\s+/).filter(Boolean).length;
    segments.push({ text: chunk, entry: null, wordStartIndex: wordCounter, wordEndIndex: wordCounter + chunkWords - 1 });
  }

  return segments;
}

function renderWithWordHighlight(
  segmentText: string,
  wordStartIndex: number,
  activeWordIndex: number,
  baseClass?: string,
): React.ReactNode[] {
  const parts = segmentText.split(/(\s+)/);
  let wordIdx = wordStartIndex;

  return parts.map((part, i) => {
    if (/^\s+$/.test(part)) {
      return <span key={i}>{part}</span>;
    }
    const isActive = wordIdx === activeWordIndex;
    wordIdx++;
    return (
      <span
        key={i}
        className={cn(
          baseClass,
          isActive && "bg-indigo-100 dark:bg-indigo-900/50 rounded-sm px-0.5 transition-colors duration-150",
        )}
      >
        {part}
      </span>
    );
  });
}

export function HighlightedText({ text, glossary, activeWordIndex = -1 }: HighlightedTextProps) {
  const segments = useMemo(() => buildSegments(text, glossary), [text, glossary]);
  const hasActiveWord = activeWordIndex >= 0;

  return (
    <span>
      {segments.map((segment, i) => {
        if (!segment.entry) {
          if (hasActiveWord) {
            return <span key={i}>{renderWithWordHighlight(segment.text, segment.wordStartIndex, activeWordIndex)}</span>;
          }
          return <span key={i}>{segment.text}</span>;
        }

        const glossaryClass = "cursor-help underline decoration-indigo-400 decoration-dotted underline-offset-2 text-indigo-700 dark:text-indigo-300";

        if (hasActiveWord) {
          return (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <span>{renderWithWordHighlight(segment.text, segment.wordStartIndex, activeWordIndex, glossaryClass)}</span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[240px] text-xs">
                {segment.entry.meaning}
              </TooltipContent>
            </Tooltip>
          );
        }

        return (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <span className={glossaryClass}>
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
