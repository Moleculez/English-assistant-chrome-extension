import { useState } from "react";
import { Copy, Check } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/components/accordion";
import { Badge } from "../../ui/components/badge";
import { Button } from "../../ui/components/button";
import type { GlossaryEntry } from "../../lib/llm/types";

interface GlossaryListProps {
  glossary: GlossaryEntry[];
}

export function GlossaryList({ glossary }: GlossaryListProps) {
  const [copied, setCopied] = useState(false);

  if (glossary.length === 0) return null;

  const handleCopyAll = async () => {
    const text = glossary
      .map((entry) => `${entry.term} \u2014 ${entry.meaning}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <div className="space-y-2" role="status" aria-live="polite">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Glossary
          </h3>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {glossary.length} {glossary.length === 1 ? "term" : "terms"}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 gap-1 text-[10px] text-muted-foreground"
          onClick={handleCopyAll}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy all
            </>
          )}
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["term-0"]} className="w-full">
        {glossary.map((entry, index) => (
          <AccordionItem
            key={index}
            value={`term-${index}`}
            className="border-l-2 border-l-indigo-300 dark:border-l-indigo-700 border-b pl-3"
          >
            <AccordionTrigger className="py-2 text-sm hover:no-underline">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {entry.term}
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              {entry.meaning}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
