import { useCallback, useEffect, useRef, useState } from "react";
import type { UserSettings } from "@/lib/storage/types";
import { DEFAULT_SETTINGS } from "@/lib/storage/types";

const DEBOUNCE_MS = 500;

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    chrome.storage.sync.get("settings", (result) => {
      if (result.settings) {
        setSettings({ ...DEFAULT_SETTINGS, ...result.settings });
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const persist = useCallback((next: UserSettings) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      chrome.storage.sync.set({ settings: next });
    }, DEBOUNCE_MS);
  }, []);

  const updateSettings = useCallback(
    (patch: Partial<UserSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  return { settings, updateSettings, loaded };
}
