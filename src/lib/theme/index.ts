export type Theme = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

/**
 * Resolve the actual theme based on user preference and system setting.
 */
export function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme;
}

/**
 * Apply theme to the document by toggling the 'dark' class.
 */
export function applyTheme(theme: ResolvedTheme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

/**
 * Listen for system theme changes.
 * Returns a cleanup function.
 */
export function onSystemThemeChange(
  callback: (theme: ResolvedTheme) => void,
): () => void {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = (e: MediaQueryListEvent): void => {
    callback(e.matches ? "dark" : "light");
  };
  mediaQuery.addEventListener("change", handler);
  return () => mediaQuery.removeEventListener("change", handler);
}

/**
 * Get the saved theme preference from chrome.storage.sync.
 */
export async function getSavedTheme(): Promise<Theme> {
  const result = await chrome.storage.sync.get("settings");
  return (result?.settings?.theme as Theme) || "system";
}

/**
 * Initialize theme on page load.
 * Reads saved preference, resolves it, applies it, and sets up system listener.
 * Returns cleanup function.
 */
export async function initializeTheme(): Promise<() => void> {
  const saved = await getSavedTheme();
  const resolved = resolveTheme(saved);
  applyTheme(resolved);

  if (saved === "system") {
    return onSystemThemeChange((theme) => applyTheme(theme));
  }
  return () => {};
}
