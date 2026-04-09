import type { UserSettings } from "./types";
import { DEFAULT_SETTINGS } from "./types";

export async function getSettings(): Promise<UserSettings> {
  const result = await chrome.storage.sync.get("settings");
  return { ...DEFAULT_SETTINGS, ...(result.settings || {}) };
}

export async function saveSettings(
  settings: Partial<UserSettings>
): Promise<void> {
  const current = await getSettings();
  await chrome.storage.sync.set({ settings: { ...current, ...settings } });
}

export function onSettingsChanged(
  callback: (settings: UserSettings) => void
): void {
  chrome.storage.sync.onChanged.addListener((changes) => {
    if (changes.settings) {
      callback({ ...DEFAULT_SETTINGS, ...changes.settings.newValue });
    }
  });
}
