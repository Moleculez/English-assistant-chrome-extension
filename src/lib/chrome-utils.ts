export function openOptionsPage(): void {
  try {
    chrome.runtime.openOptionsPage();
  } catch {
    // chrome.runtime not available outside extension context
  }
}
