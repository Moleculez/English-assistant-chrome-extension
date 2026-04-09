import type { CEFRLevel } from "../llm/types";

export interface HistoryEntry {
  id: string;
  selectedText: string;
  simplified: string;
  why: string;
  glossary: { term: string; meaning: string }[];
  level: CEFRLevel;
  sourceUrl: string;
  timestamp: number;
}

export interface UserSettings {
  defaultLevel: CEFRLevel;
  theme: "system" | "light" | "dark";
  ttsEnabled: boolean;
  ttsVoice: string;
  maxHistoryItems: number;
  [key: string]: unknown;
}

export const DEFAULT_SETTINGS: Partial<UserSettings> = {
  defaultLevel: "B1",
  theme: "system",
  ttsEnabled: true,
};
