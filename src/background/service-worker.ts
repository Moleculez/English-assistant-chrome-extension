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
  request: AnalysisRequest
): Promise<void> {
  lastAnalysisRequest = request;

  try {
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

  // Rewrite Origin header for localhost requests so Ollama doesn't reject
  // them with 403. Ollama allows "http://localhost" but not "chrome-extension://".
  const localhostHosts = ["localhost", "127.0.0.1"];
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: localhostHosts.map((_, i) => i + 1),
    addRules: localhostHosts.map((host, i) => ({
      id: i + 1,
      priority: 1,
      action: {
        type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS as chrome.declarativeNetRequest.RuleActionType,
        requestHeaders: [
          {
            header: "Origin",
            operation: chrome.declarativeNetRequest.HeaderOperation.SET,
            value: `http://${host}`,
          },
        ],
      },
      condition: {
        urlFilter: `||${host}`,
        resourceTypes: [
          chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
        ],
      },
    })),
  });
});

// ---------------------------------------------------------------------------
// Message handlers
// ---------------------------------------------------------------------------

onMessage("ANALYZE_REQUEST", async (payload, sender) => {
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

  const updatedRequest: AnalysisRequest = {
    ...lastAnalysisRequest,
    level: payload.level,
  };

  await runAnalysis(updatedRequest);
});

// ---------------------------------------------------------------------------
// Context menu handler
// ---------------------------------------------------------------------------
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "simplify-selection") return;

  // Open side panel here — context menu click IS a user gesture
  if (tab?.windowId) {
    await chrome.sidePanel.open({ windowId: tab.windowId });
  }

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

  // Open side panel here — keyboard shortcut IS a user gesture
  if (activeTab?.windowId) {
    await chrome.sidePanel.open({ windowId: activeTab.windowId });
  }

  if (activeTab?.id !== undefined) {
    await chrome.tabs.sendMessage(activeTab.id, { type: "TRIGGER_ANALYZE" });
  }
});
