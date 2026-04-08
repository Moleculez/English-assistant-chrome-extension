import type { ExtensionMessage } from "./types";

export function onMessage<T extends ExtensionMessage["type"]>(
  type: T,
  callback: (
    payload: Extract<ExtensionMessage, { type: T }> extends { payload: infer P }
      ? P
      : never,
    sender: chrome.runtime.MessageSender
  ) => void | Promise<void>
): void {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === type) {
      const result = callback(message.payload, sender);
      if (result instanceof Promise) {
        result
          .then(() => sendResponse())
          .catch((err) => {
            console.error(`Error handling ${type}:`, err);
            sendResponse();
          });
        return true;
      }
    }
  });
}
