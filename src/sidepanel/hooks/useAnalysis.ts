import { useCallback, useEffect, useState } from "react";
import type { AnalysisResponse, CEFRLevel } from "../../lib/llm/types";

type AnalysisState = "idle" | "loading" | "success" | "error";

interface UseAnalysisReturn {
  state: AnalysisState;
  analysis: AnalysisResponse | null;
  selectedText: string;
  isLoading: boolean;
  error: { message: string; retryable: boolean } | null;
  retry: (level: CEFRLevel) => void;
}

export function useAnalysis(): UseAnalysisReturn {
  const [state, setState] = useState<AnalysisState>("idle");
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [error, setError] = useState<{
    message: string;
    retryable: boolean;
  } | null>(null);

  useEffect(() => {
    const handleMessage = (
      message: { type: string; payload: unknown },
      _sender: chrome.runtime.MessageSender,
      _sendResponse: (response?: unknown) => void
    ) => {
      switch (message.type) {
        case "ANALYSIS_STARTED": {
          const payload = message.payload as { selectedText: string };
          setSelectedText(payload.selectedText);
          setAnalysis(null);
          setError(null);
          setState("loading");
          break;
        }
        case "ANALYSIS_RESULT": {
          const payload = message.payload as AnalysisResponse;
          setAnalysis(payload);
          setError(null);
          setState("success");
          break;
        }
        case "ANALYSIS_ERROR": {
          const payload = message.payload as {
            error: string;
            retryable: boolean;
          };
          setError({ message: payload.error, retryable: payload.retryable });
          setState("error");
          break;
        }
      }
    };

    try {
      chrome.runtime.onMessage.addListener(handleMessage);
      return () => {
        chrome.runtime.onMessage.removeListener(handleMessage);
      };
    } catch {
      // chrome.runtime not available
      return;
    }
  }, []);

  const retry = useCallback((level: CEFRLevel) => {
    setState("loading");
    setError(null);
    try {
      chrome.runtime.sendMessage({
        type: "RETRY_ANALYSIS",
        payload: { level },
      });
    } catch {
      // chrome.runtime not available
    }
  }, []);

  return {
    state,
    analysis,
    selectedText,
    isLoading: state === "loading",
    error,
    retry,
  };
}
