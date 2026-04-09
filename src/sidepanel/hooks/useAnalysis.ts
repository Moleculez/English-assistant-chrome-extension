import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AnalysisRequest,
  AnalysisResponse,
  CEFRLevel,
} from "../../lib/llm/types";
import { createProvider } from "../../lib/llm/provider-factory";
import { getSettings } from "../../lib/storage/settings";
import { addHistoryEntry, generateId } from "../../lib/storage/history";

interface UseAnalysisReturn {
  analysis: AnalysisResponse | null;
  selectedText: string;
  isLoading: boolean;
  streamedText: string;
  error: { message: string; retryable: boolean } | null;
  retry: (level: CEFRLevel) => void;
}

export function useAnalysis(): UseAnalysisReturn {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [error, setError] = useState<{
    message: string;
    retryable: boolean;
  } | null>(null);

  const lastRequestRef = useRef<AnalysisRequest | null>(null);

  const executeAnalysis = useCallback(async (request: AnalysisRequest) => {
    lastRequestRef.current = request;
    setSelectedText(request.selectedText);
    setAnalysis(null);
    setError(null);
    setStreamedText("");
    setIsLoading(true);

    try {
      const settings = await getSettings();
      const provider = createProvider(settings.provider);

      let result: AnalysisResponse;
      try {
        result = await provider.analyzeStream(request, (token) => {
          setStreamedText((prev) => prev + token);
        });
      } catch {
        // Fall back to non-streaming if analyzeStream fails
        setStreamedText("");
        result = await provider.analyze(request);
      }

      setAnalysis(result);
      setError(null);

      await addHistoryEntry({
        id: generateId(),
        selectedText: request.selectedText,
        simplified: result.simplified,
        why: result.why,
        glossary: result.glossary,
        level: request.level,
        sourceUrl: request.pageUrl,
        timestamp: Date.now(),
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError({ message, retryable: true });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleMessage = (msg: { type: string; payload: unknown }) => {
      if (msg.type === "RUN_ANALYSIS") {
        executeAnalysis(msg.payload as AnalysisRequest);
      }
    };

    try {
      chrome.runtime.onMessage.addListener(handleMessage);
      return () => chrome.runtime.onMessage.removeListener(handleMessage);
    } catch {
      return;
    }
  }, [executeAnalysis]);

  const retry = useCallback(
    (level: CEFRLevel) => {
      if (!lastRequestRef.current) return;
      executeAnalysis({ ...lastRequestRef.current, level });
    },
    [executeAnalysis],
  );

  return { analysis, selectedText, isLoading, streamedText, error, retry };
}
