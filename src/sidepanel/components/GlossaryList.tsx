import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/components/accordion";
import { Badge } from "../../ui/components/badge";
import type { GlossaryEntry } from "../../lib/llm/types";

interface GlossaryListProps {
  glossary: GlossaryEntry[];
}

export function GlossaryList({ glossary }: GlossaryListProps) {
  if (glossary.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Glossary
        </h3>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
          {glossary.length}
        </Badge>
      </div>

      <Accordion type="multiple" className="w-full">
        {glossary.map((entry, index) => (
          <AccordionItem key={index} value={`term-${index}`}>
            <AccordionTrigger className="py-2 text-sm hover:no-underline">
              <span className="font-medium text-indigo-600 dark:text-indigo-400">
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
