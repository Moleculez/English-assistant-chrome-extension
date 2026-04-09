import type { Theme } from "../theme";

export async function saveTheme(theme: Theme): Promise<void> {
  const result = await chrome.storage.sync.get("settings");
  const settings = (result?.settings as Record<string, unknown>) || {};
  settings.theme = theme;
  await chrome.storage.sync.set({ settings });
}

export function onThemeSettingChanged(
  callback: (theme: Theme) => void,
): () => void {
  const listener = (changes: { [key: string]: chrome.storage.StorageChange }): void => {
    if (changes.settings?.newValue?.theme) {
      callback(changes.settings.newValue.theme as Theme);
    }
  };
  chrome.storage.sync.onChanged.addListener(listener);
  return () => chrome.storage.sync.onChanged.removeListener(listener);
}
