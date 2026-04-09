import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../ui/components/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/components/accordion";
import { Button } from "../../ui/components/button";
import { Badge } from "../../ui/components/badge";
import { Separator } from "../../ui/components/separator";
import { cn } from "../../ui/cn";
import type { AnalysisResponse, CEFRLevel } from "../../lib/llm/types";
import type { TtsProvider } from "../../lib/storage/types";
import { countWords } from "../../lib/utils/text";
import { getSettings, onSettingsChanged } from "../../lib/storage/settings";
import { useTts } from "../hooks/useTts";
import { GlossaryList } from "./GlossaryList";
import { HighlightedText } from "./HighlightedText";
import { TtsButton } from "./TtsButton";
import { AudioProgress } from "./AudioProgress";

interface AnalysisViewProps {
  analysis: AnalysisResponse | null;
  selectedText: string;
  currentLevel: CEFRLevel;
  streamedText?: string;
  isStreaming?: boolean;
}


function confidenceColor(value: number): string {
  if (value > 0.8) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  if (value >= 0.5) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
}

export function AnalysisView({
  analysis,
  selectedText,
  currentLevel,
  streamedText,
  isStreaming,
}: AnalysisViewProps) {
  const [copied, setCopied] = useState(false);
  const [ttsVoice, setTtsVoice] = useState("");
  const [ttsProvider, setTtsProvider] = useState<TtsProvider>("browser");
  const [coquiServerUrl, setCoquiServerUrl] = useState("http://localhost:5100");

  const tts = useTts();

  useEffect(() => {
    getSettings().then((s) => {
      setTtsVoice(s.ttsVoice);
      setTtsProvider(s.ttsProvider);
      setCoquiServerUrl(s.coquiServerUrl);
    });
    return onSettingsChanged((s) => {
      setTtsVoice(s.ttsVoice);
      setTtsProvider(s.ttsProvider);
      setCoquiServerUrl(s.coquiServerUrl);
    });
  }, []);

  const handleCopy = async () => {
    if (!analysis) return;
    try {
      await navigator.clipboard.writeText(analysis.simplified);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  if (isStreaming && streamedText) {
    return (
      <div className="space-y-3 p-4">
        <Card>
          <CardHeader className="p-3 pb-0">
            <CardTitle className="text-xs text-muted-foreground">
              Analyzing...
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1.5">
            <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-muted-foreground">
              {streamedText}
              <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-indigo-500 animate-pulse rounded-sm" />
            </pre>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analysis) return null;

  const originalWords = countWords(selectedText);
  const simplifiedWords = countWords(analysis.simplified);
  const isTtsActive = tts.isPlaying || tts.isPaused;

  return (
    <div className="space-y-3 p-4">
      {/* Simplified text (hero) */}
      <Card className="border-indigo-200 dark:border-indigo-900">
        <CardHeader className="p-3 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xs text-muted-foreground">
                Simplified
              </CardTitle>
              <Badge
                className={cn(
                  "text-[10px] px-1.5 py-0 border-0",
                  confidenceColor(analysis.confidence),
                )}
              >
                {Math.round(analysis.confidence * 100)}% confident
              </Badge>
            </div>
            <TtsButton
              text={analysis.simplified}
              tts={tts}
              voiceURI={ttsVoice || undefined}
              ttsProvider={ttsProvider}
              coquiServerUrl={coquiServerUrl}
            />
          </div>
        </CardHeader>

        <AudioProgress
          progress={tts.progress}
          duration={tts.duration}
          canSeek={tts.canSeek}
          isActive={isTtsActive}
          onSeek={tts.seek}
        />

        <CardContent className="p-3 pt-1.5">
          <p className="text-base leading-relaxed border-l-2 border-indigo-400 pl-3">
            <HighlightedText
              text={analysis.simplified}
              glossary={analysis.glossary}
              activeWordIndex={isTtsActive ? tts.currentWordIndex : undefined}
            />
          </p>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Original: {originalWords} words &rarr; Simplified: {simplifiedWords} words
          </p>
        </CardContent>
      </Card>

      {/* Collapsible details */}
      <Card>
        <CardContent className="p-0">
          <Accordion type="multiple" className="w-full">
            {analysis.why && (
              <AccordionItem value="why">
                <AccordionTrigger className="px-3 py-2 text-xs text-muted-foreground hover:no-underline">
                  Why
                </AccordionTrigger>
                <AccordionContent className="px-3 text-xs text-muted-foreground leading-relaxed">
                  {analysis.why}
                </AccordionContent>
              </AccordionItem>
            )}

            <AccordionItem value="original">
              <AccordionTrigger className="px-3 py-2 text-xs text-muted-foreground hover:no-underline">
                Original
              </AccordionTrigger>
              <AccordionContent className="px-3 text-xs text-muted-foreground leading-relaxed">
                {selectedText}
              </AccordionContent>
            </AccordionItem>

            {analysis.glossary.length > 0 && (
              <AccordionItem value="glossary" className="border-b-0">
                <AccordionTrigger className="px-3 py-2 text-xs text-muted-foreground hover:no-underline">
                  Glossary ({analysis.glossary.length})
                </AccordionTrigger>
                <AccordionContent className="px-3">
                  <GlossaryList glossary={analysis.glossary} />
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </CardContent>
      </Card>

      {/* Action bar */}
      <Separator />
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-[10px]">
          {currentLevel}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
