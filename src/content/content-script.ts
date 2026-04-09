import { extractContext } from "./context-extractor";
import { showFloatingIcon, hideFloatingIcon, getButtonPosition } from "./floating-icon";
import { showTooltip, updateTooltip, hideTooltip } from "./floating-tooltip";
import { sendToServiceWorker } from "@/lib/messages/sender";
import type { ExtensionMessage } from "@/lib/messages/types";

const SELECTION_DEBOUNCE_MS = 150;
const MIN_SELECTION_LENGTH = 3;
const TOOLTIP_AUTO_DISMISS_MS = 8000;
const TOOLTIP_HINT = "Click to simplify in Easy English";
const PDF_TOOLTIP_HINT = "Right-click → Simplify in Easy English";

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
    (e.target.closest(".eer-floating-btn") || e.target.closest(".eer-tooltip") || e.target.closest(".eer-pdf-hint"))
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
    (e.target.closest(".eer-floating-btn") || e.target.closest(".eer-tooltip") || e.target.closest(".eer-pdf-hint"))
  ) {
    return;
  }
  hideAll();
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

/**
 * PDF pages: Chrome's PDF viewer renders inside an isolated <embed>.
 * Content scripts can't read selections inside it, but mouseup events
 * DO fire on the embed element. Show a floating button on mouseup that
 * guides the user to right-click or use the keyboard shortcut.
 */
function initPdfSupport(): void {
  const embed = document.querySelector('embed[type="application/pdf"]') as HTMLElement | null;
  const target = embed ?? document.body;

  // On mouseup inside the PDF area, show a floating action button
  target.addEventListener("mouseup", (e: Event) => {
    const me = e as MouseEvent;

    if (debounceTimer !== null) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      // Show the floating icon at the mouse position
      // When clicked, trigger the keyboard shortcut flow (service worker will
      // use context menu selectionText which works for PDFs)
      showFloatingIcon(me.clientX, me.clientY, () => {
        hideAll();
        // Send to service worker which triggers the keyboard shortcut path
        chrome.runtime.sendMessage({ type: "TRIGGER_ANALYZE" }).catch(() => {});
      });

      const pos = getButtonPosition();
      if (pos) {
        showTooltip(pos.left, pos.top, PDF_TOOLTIP_HINT);
        startTooltipDismissTimer();
      }
    }, SELECTION_DEBOUNCE_MS);
  });

  target.addEventListener("mousedown", () => {
    hideAll();
  });
}

function init(): void {
  if (isExtensionPage()) return;

  chrome.runtime.onMessage.addListener(onMessage);

  if (isPdfPage()) {
    initPdfSupport();
  } else {
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousedown", onMouseDown);
  }
}

init();
