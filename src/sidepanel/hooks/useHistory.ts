import { useCallback, useEffect, useState } from "react";
import type { HistoryEntry } from "../../lib/storage/types";

interface UseHistoryReturn {
  history: HistoryEntry[];
  clearHistory: () => void;
}

export function useHistory(): UseHistoryReturn {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    try {
      chrome.storage.session.get("history", (result) => {
        if (result.history && Array.isArray(result.history)) {
          setHistory(result.history as HistoryEntry[]);
        }
      });

      const handleChanges = (
        changes: { [key: string]: chrome.storage.StorageChange },
        areaName: string
      ) => {
        if (areaName === "session" && changes.history) {
          setHistory(
            (changes.history.newValue as HistoryEntry[] | undefined) ?? []
          );
        }
      };

      chrome.storage.onChanged.addListener(handleChanges);
      return () => {
        chrome.storage.onChanged.removeListener(handleChanges);
      };
    } catch {
      // chrome.storage not available
      return;
    }
  }, []);

  const clearHistory = useCallback(() => {
    try {
      chrome.storage.session.set({ history: [] });
    } catch {
      // chrome.storage not available
    }
    setHistory([]);
  }, []);

  return { history, clearHistory };
}
