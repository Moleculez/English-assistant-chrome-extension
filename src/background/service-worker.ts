import type { AnalysisRequest, CEFRLevel } from "../lib/llm/types";
import { onMessage } from "../lib/messages/handler";
import { getSettings } from "../lib/storage/settings";

let lastAnalysisRequest: AnalysisRequest | null = null;

function isPdfUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    return new URL(url).pathname.toLowerCase().endsWith(".pdf");
  } catch {
    return false;
  }
}

function sendToSidePanel(message: unknown): Promise<void> {
  return chrome.runtime.sendMessage(message).catch(() => {});
}

async function runAnalysis(request: AnalysisRequest): Promise<void> {
  lastAnalysisRequest = request;
  await sendToSidePanel({ type: "RUN_ANALYSIS", payload: request });
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
  return { ...payload, level };
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

  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch(() => {});
});

// ---------------------------------------------------------------------------
// Message handlers
// ---------------------------------------------------------------------------

onMessage("ANALYZE_REQUEST", async (payload) => {
  const settings = await getSettings();
  const request = buildAnalysisRequest(payload, settings.defaultLevel);
  await runAnalysis(request);
});

onMessage("RETRY_ANALYSIS", async (payload) => {
  if (!lastAnalysisRequest) {
    await sendToSidePanel({
      type: "ANALYSIS_ERROR",
      payload: { error: "No previous analysis to retry.", retryable: false },
    });
    return;
  }
  await runAnalysis({ ...lastAnalysisRequest, level: payload.level });
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
    await runAnalysis(request);
  } else if (tab?.id !== undefined) {
    await chrome.tabs.sendMessage(tab.id, { type: "TRIGGER_ANALYZE" }).catch(() => {});
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
    await chrome.tabs.sendMessage(activeTab.id, { type: "TRIGGER_ANALYZE" }).catch(() => {});
  }
});
