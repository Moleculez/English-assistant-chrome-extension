import { extractContext } from "./context-extractor";
import { showFloatingIcon, hideFloatingIcon } from "./floating-icon";
import { sendToServiceWorker } from "@/lib/messages/sender";
import type { TriggerAnalyzeMessage } from "@/lib/messages/types";

const SELECTION_DEBOUNCE_MS = 150;
const MIN_SELECTION_LENGTH = 3;

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function isExtensionPage(): boolean {
  return location.protocol === "chrome-extension:";
}

function analyzeSelection(): void {
  const context = extractContext();
  if (!context) return;

  hideFloatingIcon();
  sendToServiceWorker({
    type: "ANALYZE_REQUEST",
    payload: context,
  });
}

function handleSelectionChange(x: number, y: number): void {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) {
    hideFloatingIcon();
    return;
  }

  const text = selection.toString().trim();
  if (text.length < MIN_SELECTION_LENGTH) {
    hideFloatingIcon();
    return;
  }

  showFloatingIcon(x, y, analyzeSelection);
}

function onMouseUp(e: MouseEvent): void {
  if (
    e.target instanceof HTMLElement &&
    e.target.closest(".eer-floating-btn")
  ) {
    return;
  }

  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    handleSelectionChange(e.clientX, e.clientY);
  }, SELECTION_DEBOUNCE_MS);
}

function onMouseDown(e: MouseEvent): void {
  if (
    e.target instanceof HTMLElement &&
    e.target.closest(".eer-floating-btn")
  ) {
    return;
  }
  hideFloatingIcon();
}

function onMessage(
  message: TriggerAnalyzeMessage,
  _sender: chrome.runtime.MessageSender,
  _sendResponse: (response?: unknown) => void
): void {
  if (message.type === "TRIGGER_ANALYZE") {
    analyzeSelection();
  }
}

function init(): void {
  if (isExtensionPage()) return;

  document.addEventListener("mouseup", onMouseUp);
  document.addEventListener("mousedown", onMouseDown);
  chrome.runtime.onMessage.addListener(onMessage);
}

init();
