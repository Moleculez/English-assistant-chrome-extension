import type { CEFRLevel, GlossaryEntry, ProviderConfig } from "../llm/types";

export type TtsProvider = "browser" | "coqui";

export interface UserSettings {
  provider: ProviderConfig;
  defaultLevel: CEFRLevel;
  theme: "system" | "light" | "dark";
  ttsEnabled: boolean;
  ttsProvider: TtsProvider;
  ttsVoice: string;
  coquiServerUrl: string;
  sendMinimalContext: boolean;
  maxHistoryItems: number;
}

export interface HistoryEntry {
  id: string;
  selectedText: string;
  simplified: string;
  why: string;
  glossary: GlossaryEntry[];
  level: CEFRLevel;
  sourceUrl: string;
  timestamp: number;
}

export const DEFAULT_SETTINGS: UserSettings = {
  provider: { type: "openrouter", apiKey: "", model: "openai/gpt-4o-mini" },
  defaultLevel: "B1",
  theme: "system",
  ttsEnabled: true,
  ttsProvider: "browser",
  ttsVoice: "",
  coquiServerUrl: "http://localhost:5100",
  sendMinimalContext: false,
  maxHistoryItems: 50,
};
