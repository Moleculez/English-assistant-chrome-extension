import { useCallback, useEffect, useState } from "react";
import { TooltipProvider } from "../ui/components/tooltip";
import { ThemeProvider } from "../ui/theme-provider";
import { ScrollArea } from "../ui/components/scroll-area";
import type { AnalysisResponse, CEFRLevel } from "../lib/llm/types";
import type { HistoryEntry } from "../lib/storage/types";
import { getSettings, onSettingsChanged } from "../lib/storage/settings";
import { useAnalysis } from "./hooks/useAnalysis";
import { useHistory } from "./hooks/useHistory";
import { Header } from "./components/Header";
import { AnalysisView } from "./components/AnalysisView";
import { HistoryList } from "./components/HistoryList";
import { LoadingState } from "./components/LoadingState";
import { ErrorState } from "./components/ErrorState";
import { EmptyState } from "./components/EmptyState";

export function App() {
  const {
    analysis: liveAnalysis,
    selectedText: liveSelectedText,
    isLoading,
    streamedText,
    error,
    retry,
  } = useAnalysis();

  const { history, clearHistory } = useHistory();

  const [currentLevel, setCurrentLevel] = useState<CEFRLevel>("B1");
  const [showHistory, setShowHistory] = useState(false);
  const [restoredAnalysis, setRestoredAnalysis] =
    useState<AnalysisResponse | null>(null);
  const [restoredSelectedText, setRestoredSelectedText] = useState("");

  useEffect(() => {
    getSettings().then((s) => setCurrentLevel(s.defaultLevel));
    return onSettingsChanged((s) => setCurrentLevel(s.defaultLevel));
  }, []);

  const analysis = restoredAnalysis ?? liveAnalysis;
  const selectedText = restoredAnalysis
    ? restoredSelectedText
    : liveSelectedText;

  const handleLevelChange = useCallback(
    (level: CEFRLevel) => {
      setCurrentLevel(level);
      if (analysis) {
        retry(level);
        setRestoredAnalysis(null);
      }
    },
    [analysis, retry]
  );

  const handleRestore = useCallback((entry: HistoryEntry) => {
    setRestoredAnalysis({
      simplified: entry.simplified,
      why: entry.why,
      glossary: entry.glossary,
      confidence: 1,
    });
    setRestoredSelectedText(entry.selectedText);
    setShowHistory(false);
  }, []);

  const handleRetry = useCallback(() => {
    setRestoredAnalysis(null);
    retry(currentLevel);
  }, [retry, currentLevel]);

  const renderContent = () => {
    if (showHistory) {
      return (
        <HistoryList
          history={history}
          onRestore={handleRestore}
          onClear={clearHistory}
        />
      );
    }

    if (isLoading && !streamedText) {
      return <LoadingState selectedText={selectedText} />;
    }

    if (isLoading && streamedText) {
      return (
        <AnalysisView
          analysis={null}
          selectedText={selectedText}
          currentLevel={currentLevel}
          streamedText={streamedText}
          isStreaming
        />
      );
    }

    if (error) {
      return (
        <ErrorState
          message={error.message}
          retryable={error.retryable}
          onRetry={handleRetry}
        />
      );
    }

    if (analysis) {
      return (
        <AnalysisView
          analysis={analysis}
          selectedText={selectedText}
          currentLevel={currentLevel}
        />
      );
    }

    return <EmptyState />;
  };

  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={300}>
        <div className="flex h-screen flex-col bg-background">
          <Header
            currentLevel={currentLevel}
            onLevelChange={handleLevelChange}
            showHistory={showHistory}
            onToggleHistory={() => setShowHistory((prev) => !prev)}
          />
          <ScrollArea className="flex-1">
            <main>{renderContent()}</main>
          </ScrollArea>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
}
