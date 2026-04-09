import type { AnalyzeRequestMessage } from "./types";

export function sendToServiceWorker(
  message: AnalyzeRequestMessage
): Promise<void> {
  return chrome.runtime.sendMessage(message).catch(() => {});
}
