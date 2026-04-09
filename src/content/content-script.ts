import { extractContext } from "./context-extractor";
import { showFloatingIcon, hideFloatingIcon, getButtonPosition } from "./floating-icon";
import { showTooltip, updateTooltip, hideTooltip } from "./floating-tooltip";
import { sendToServiceWorker } from "@/lib/messages/sender";
import type { ExtensionMessage } from "@/lib/messages/types";

const SELECTION_DEBOUNCE_MS = 150;
const MIN_SELECTION_LENGTH = 3;
const TOOLTIP_AUTO_DISMISS_MS = 8000;
const TOOLTIP_HINT = "Click to simplify in Easy English";

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let tooltipDismissTimer: ReturnType<typeof setTimeout> | null = null;

function clearTooltipDismissTimer(): void {
  clearTimeout(tooltipDismissTimer ?? undefined);
  tooltipDismissTimer = null;
}

function startTooltipDismissTimer(): void {
  clearTooltipDismissTimer();
  tooltipDismissTimer = setTimeout(() => {
    hideTooltip();
  }, TOOLTIP_AUTO_DISMISS_MS);
}

function hideAll(): void {
  hideFloatingIcon();
  hideTooltip();
  clearTooltipDismissTimer();
}

function isExtensionPage(): boolean {
  return location.protocol === "chrome-extension:";
}

function isPdfPage(): boolean {
  const url = location.href.toLowerCase();
  if (url.endsWith(".pdf") || url.includes(".pdf?") || url.includes(".pdf#")) {
    return true;
  }
  return !!document.querySelector('embed[type="application/pdf"]');
}

function analyzeSelection(): void {
  const context = extractContext();
  if (!context) return;

  hideAll();
  sendToServiceWorker({
    type: "ANALYZE_REQUEST",
    payload: context,
  });
}

function showTooltipNearButton(): void {
  const pos = getButtonPosition();
  if (!pos) return;
  showTooltip(pos.left, pos.top, TOOLTIP_HINT);
  startTooltipDismissTimer();
}

function getSelectionPosition(): { x: number; y: number } | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  try {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return null;
    return { x: rect.right, y: rect.top };
  } catch {
    return null;
  }
}

function handleSelectionChange(x: number, y: number): void {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) {
    hideAll();
    return;
  }

  const text = selection.toString().trim();
  if (text.length < MIN_SELECTION_LENGTH) {
    hideAll();
    return;
  }

  showFloatingIcon(x, y, analyzeSelection);
  showTooltipNearButton();
}

function onMouseUp(e: MouseEvent): void {
  if (
    e.target instanceof HTMLElement &&
    (e.target.closest(".eer-floating-btn") || e.target.closest(".eer-tooltip"))
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
    (e.target.closest(".eer-floating-btn") || e.target.closest(".eer-tooltip"))
  ) {
    return;
  }
  hideAll();
}

// For PDF pages: mouseup doesn't fire from the embed, so we poll
// selectionchange and derive position from the selection rect.
function onSelectionChange(): void {
  if (debounceTimer !== null) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      hideAll();
      return;
    }
    const text = selection.toString().trim();
    if (text.length < MIN_SELECTION_LENGTH) {
      hideAll();
      return;
    }

    const pos = getSelectionPosition();
    if (pos) {
      showFloatingIcon(pos.x, pos.y, analyzeSelection);
      showTooltipNearButton();
    }
  }, SELECTION_DEBOUNCE_MS);
}

function onMessage(
  message: ExtensionMessage,
  _sender: chrome.runtime.MessageSender,
  _sendResponse: (response?: unknown) => void
): void {
  if (message.type === "TRIGGER_ANALYZE") {
    analyzeSelection();
  } else if (message.type === "ANALYSIS_PREVIEW") {
    clearTooltipDismissTimer();
    updateTooltip(message.payload.preview);
    startTooltipDismissTimer();
  }
}

function init(): void {
  if (isExtensionPage()) return;

  document.addEventListener("mouseup", onMouseUp);
  document.addEventListener("mousedown", onMouseDown);
  chrome.runtime.onMessage.addListener(onMessage);

  // PDF pages: the embed swallows mouse events, so also listen to
  // selectionchange which fires when text is selected inside the PDF viewer.
  if (isPdfPage()) {
    document.addEventListener("selectionchange", onSelectionChange);
  }
}

init();
