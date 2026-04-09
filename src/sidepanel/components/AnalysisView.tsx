import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../ui/components/card";
import { Button } from "../../ui/components/button";
import { Badge } from "../../ui/components/badge";
import { Separator } from "../../ui/components/separator";
import type { AnalysisResponse, CEFRLevel } from "../../lib/llm/types";
import { GlossaryList } from "./GlossaryList";
import { TtsButton } from "./TtsButton";

interface AnalysisViewProps {
  analysis: AnalysisResponse;
  selectedText: string;
  currentLevel: CEFRLevel;
}

export function AnalysisView({
  analysis,
  selectedText,
  currentLevel,
}: AnalysisViewProps) {
  const [showOriginal, setShowOriginal] = useState(false);
  const [copied, setCopied] = useState(false);

  const truncatedOriginal =
    selectedText.length > 100
      ? selectedText.slice(0, 100) + "..."
      : selectedText;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(analysis.simplified);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <div className="space-y-3 p-4">
      {/* Original text */}
      <Card>
        <CardHeader className="p-3 pb-0">
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className="flex w-full items-center justify-between text-left"
          >
            <CardTitle className="text-xs text-muted-foreground">
              Original
            </CardTitle>
            {showOriginal ? (
              <ChevronUp className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            )}
          </button>
        </CardHeader>
        <CardContent className="p-3 pt-1.5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {showOriginal ? selectedText : truncatedOriginal}
          </p>
        </CardContent>
      </Card>

      {/* Simplified text */}
      <Card className="border-indigo-200 dark:border-indigo-900">
        <CardHeader className="p-3 pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs text-muted-foreground">
              Simplified
            </CardTitle>
            <TtsButton text={analysis.simplified} />
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-1.5">
          <p className="text-sm leading-relaxed">{analysis.simplified}</p>
        </CardContent>
      </Card>

      {/* Why explanation */}
      {analysis.why && (
        <Card>
          <CardHeader className="p-3 pb-0">
            <CardTitle className="text-xs text-muted-foreground">
              Why
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1.5">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {analysis.why}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Glossary */}
      {analysis.glossary.length > 0 && (
        <Card>
          <CardContent className="p-3">
            <GlossaryList glossary={analysis.glossary} />
          </CardContent>
        </Card>
      )}

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
