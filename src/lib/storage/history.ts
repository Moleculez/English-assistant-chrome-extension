import type { HistoryEntry } from "./types";
import { DEFAULT_SETTINGS } from "./types";

export async function getHistory(): Promise<HistoryEntry[]> {
  const result = await chrome.storage.session.get("history");
  return result.history || [];
}

export async function addHistoryEntry(
  entry: HistoryEntry,
  maxItems: number = DEFAULT_SETTINGS.maxHistoryItems
): Promise<void> {
  const history = await getHistory();
  history.unshift(entry);
  const trimmed = history.slice(0, maxItems);
  await chrome.storage.session.set({ history: trimmed });
}

export async function clearHistory(): Promise<void> {
  await chrome.storage.session.set({ history: [] });
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
