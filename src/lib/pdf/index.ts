export interface PdfContext {
  selectedText: string;
  pageTitle: string;
  pageUrl: string;
  sourceType: "pdf";
  isPdf: true;
}

/**
 * Detect if the current page is a PDF.
 * Checks URL extension, embed/object elements with PDF type,
 * and Chrome's built-in PDF viewer.
 */
export function isPdfPage(url: string, doc?: Document): boolean {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    if (pathname.endsWith(".pdf")) return true;
  } catch {
    // Invalid URL, fall through to other checks
  }

  if (url.startsWith("chrome-extension://") && url.includes("pdf")) {
    return true;
  }

  if (!doc) return false;

  const embeds = doc.querySelectorAll('embed[type="application/pdf"]');
  if (embeds.length > 0) return true;

  const objects = doc.querySelectorAll('object[type="application/pdf"]');
  if (objects.length > 0) return true;

  const viewer = doc.querySelector('embed[name="plugin"]');
  if (
    viewer &&
    viewer.getAttribute("type") === "application/x-google-chrome-pdf"
  ) {
    return true;
  }

  return false;
}

/**
 * Extract context from a PDF page selection.
 * In the MVP, context is limited to selection text and page metadata.
 */
export function extractPdfContext(
  selectionText: string,
  pageUrl: string,
  pageTitle: string,
): PdfContext {
  return {
    selectedText: selectionText,
    pageTitle,
    pageUrl,
    sourceType: "pdf",
    isPdf: true,
  };
}

/**
 * Build a minimal analysis request payload for PDF selections.
 * Context fields are empty since we can't extract DOM context from PDFs.
 */
export function buildPdfAnalysisPayload(context: PdfContext): {
  selectedText: string;
  leftContext: string;
  rightContext: string;
  paragraph: string;
  heading: string;
  pageTitle: string;
  pageUrl: string;
  sourceType: "pdf";
} {
  return {
    selectedText: context.selectedText,
    leftContext: "",
    rightContext: "",
    paragraph: "",
    heading: "",
    pageTitle: context.pageTitle,
    pageUrl: context.pageUrl,
    sourceType: "pdf",
  };
}
