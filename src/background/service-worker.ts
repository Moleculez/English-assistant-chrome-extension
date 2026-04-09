import type { AnalysisRequest, CEFRLevel } from "../lib/llm/types";
import { createProvider } from "../lib/llm/provider-factory";
import { onMessage } from "../lib/messages/handler";
import { getSettings } from "../lib/storage/settings";
import { addHistoryEntry, generateId } from "../lib/storage/history";

// ---------------------------------------------------------------------------
// State: track the last analysis request so RETRY_ANALYSIS can re-run it
// ---------------------------------------------------------------------------
let lastAnalysisRequest: AnalysisRequest | null = null;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isPdfUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const pathname = new URL(url).pathname;
    return pathname.toLowerCase().endsWith(".pdf");
  } catch {
    return false;
  }
}

/** Send a message to the side panel, ignoring errors if it is not open yet. */
function sendToSidePanel(message: unknown): Promise<void> {
  return chrome.runtime.sendMessage(message).catch(() => {
    // Side panel may not be open yet; ignore send failures
  });
}

// ---------------------------------------------------------------------------
// Core analysis pipeline
// ---------------------------------------------------------------------------
async function runAnalysis(
  request: AnalysisRequest,
  tabId: number | undefined
): Promise<void> {
  lastAnalysisRequest = request;

  try {
    if (tabId !== undefined) {
      const tab = await chrome.tabs.get(tabId);
      if (tab.windowId !== undefined) {
        await chrome.sidePanel.open({ windowId: tab.windowId });
      }
    }

    await sendToSidePanel({
      type: "ANALYSIS_STARTED",
      payload: { selectedText: request.selectedText },
    });

    const settings = await getSettings();
    const provider = createProvider(settings.provider);
    const result = await provider.analyze(request);

    await sendToSidePanel({
      type: "ANALYSIS_RESULT",
      payload: result,
    });

    await addHistoryEntry({
      id: generateId(),
      selectedText: request.selectedText,
      simplified: result.simplified,
      why: result.why,
      glossary: result.glossary,
      level: request.level,
      sourceUrl: request.pageUrl,
      timestamp: Date.now(),
    });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    await sendToSidePanel({
      type: "ANALYSIS_ERROR",
      payload: { error: errorMessage, retryable: true },
    });
  }
}

function buildAnalysisRequest(
  payload: {
    selectedText: string;
    leftContext: string;
    rightContext: string;
    paragraph: string;
    heading: string;
    pageTitle: string;
    pageUrl: string;
    sourceType: "html" | "pdf";
  },
  level: CEFRLevel
): AnalysisRequest {
  return {
    selectedText: payload.selectedText,
    leftContext: payload.leftContext,
    rightContext: payload.rightContext,
    paragraph: payload.paragraph,
    heading: payload.heading,
    pageTitle: payload.pageTitle,
    pageUrl: payload.pageUrl,
    sourceType: payload.sourceType,
    level,
  };
}

// ---------------------------------------------------------------------------
// Extension installed / startup
// ---------------------------------------------------------------------------
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "simplify-selection",
    title: "Simplify in Easy English",
    contexts: ["selection"],
  });

  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

// ---------------------------------------------------------------------------
// Message handlers
// ---------------------------------------------------------------------------

onMessage("ANALYZE_REQUEST", async (payload, sender) => {
  const settings = await getSettings();
  const request = buildAnalysisRequest(payload, settings.defaultLevel);
  await runAnalysis(request, sender.tab?.id);
});

onMessage("RETRY_ANALYSIS", async (payload) => {
  if (!lastAnalysisRequest) {
    await sendToSidePanel({
      type: "ANALYSIS_ERROR",
      payload: { error: "No previous analysis to retry.", retryable: false },
    });
    return;
  }

  const updatedRequest: AnalysisRequest = {
    ...lastAnalysisRequest,
    level: payload.level,
  };

  await runAnalysis(updatedRequest, undefined);
});

// ---------------------------------------------------------------------------
// Context menu handler
// ---------------------------------------------------------------------------
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "simplify-selection") return;

  if (isPdfUrl(tab?.url) && info.selectionText) {
    const settings = await getSettings();
    const request = buildAnalysisRequest(
      {
        selectedText: info.selectionText,
        leftContext: "",
        rightContext: "",
        paragraph: "",
        heading: "",
        pageTitle: tab?.title ?? "",
        pageUrl: tab?.url ?? "",
        sourceType: "pdf",
      },
      settings.defaultLevel
    );
    await runAnalysis(request, tab?.id);
  } else if (tab?.id !== undefined) {
    await chrome.tabs.sendMessage(tab.id, { type: "TRIGGER_ANALYZE" });
  }
});

// ---------------------------------------------------------------------------
// Keyboard shortcut handler
// ---------------------------------------------------------------------------
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "simplify-selection") return;

  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (activeTab?.id !== undefined) {
    await chrome.tabs.sendMessage(activeTab.id, { type: "TRIGGER_ANALYZE" });
  }
});
