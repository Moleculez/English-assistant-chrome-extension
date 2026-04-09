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

function isOwnElement(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    !!(target.closest(".eer-floating-btn") || target.closest(".eer-tooltip") || target.closest(".eer-pdf-fab"))
  );
}

function onMouseUp(e: MouseEvent): void {
  if (isOwnElement(e.target)) return;

  if (debounceTimer !== null) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    handleSelectionChange(e.clientX, e.clientY);
  }, SELECTION_DEBOUNCE_MS);
}

function onMouseDown(e: MouseEvent): void {
  if (isOwnElement(e.target)) return;
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
 * PDF: Show a persistent FAB. Also try capture-phase mouseup on window
 * and selectionchange — in some Chrome versions these fire for PDF selections.
 */
function initPdfSupport(): void {
  // Persistent FAB in bottom-right corner
  const fab = document.createElement("button");
  fab.className = "eer-pdf-fab";
  fab.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none" width="22" height="22">
    <rect width="128" height="128" rx="28" fill="#6366f1"/>
    <path d="M28 42C28 39 30 37 33 37L60 37C62 37 62 37 62 39L62 92C62 94 60 94 58 93C52 90 42 88 33 88C30 88 28 86 28 84Z" fill="white" opacity="0.9"/>
    <path d="M66 39C66 37 66 37 68 37L95 37C98 37 100 39 100 42L100 84C100 86 98 88 95 88C86 88 76 90 70 93C68 94 66 94 66 92Z" fill="white"/>
    <g transform="translate(94,28)"><path d="M0-10C1-3 3-1 10 0 3 1 1 3 0 10-1 3-3 1-10 0-3-1-1-3 0-10Z" fill="#fbbf24"/></g>
  </svg>`;
  fab.title = "Select text → Right-click → Simplify in Easy English";

  fab.addEventListener("click", (e) => {
    e.stopPropagation();
    const rect = fab.getBoundingClientRect();
    showTooltip(
      rect.left - 230,
      rect.top,
      "Select text, then right-click →\nSimplify in Easy English"
    );
    startTooltipDismissTimer();
  });

  document.body.appendChild(fab);

  // Try capture-phase listeners — some Chrome versions propagate these for PDFs
  window.addEventListener(
    "mouseup",
    (e: MouseEvent) => {
      if (isOwnElement(e.target)) return;
      if (debounceTimer !== null) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        handleSelectionChange(e.clientX, e.clientY);
      }, SELECTION_DEBOUNCE_MS);
    },
    true
  );

  window.addEventListener(
    "mousedown",
    (e: MouseEvent) => {
      if (isOwnElement(e.target)) return;
      hideAll();
    },
    true
  );

  // selectionchange fallback
  document.addEventListener("selectionchange", () => {
    if (debounceTimer !== null) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;
      const text = sel.toString().trim();
      if (text.length < MIN_SELECTION_LENGTH) return;

      try {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          showFloatingIcon(rect.right, rect.top, analyzeSelection);
          showTooltipNearButton();
        }
      } catch {
        // Selection rect not available
      }
    }, 300);
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
