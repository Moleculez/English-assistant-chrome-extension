import type { SelectionContext, SourceType } from "@/lib/messages/types";

export type { SelectionContext };

const CONTEXT_CHAR_LIMIT = 500;

const BLOCK_TAGS = new Set([
  "P",
  "DIV",
  "SECTION",
  "ARTICLE",
  "BLOCKQUOTE",
  "LI",
  "TD",
  "TH",
  "DD",
  "DT",
  "FIGCAPTION",
  "PRE",
]);

const HEADING_TAGS = new Set(["H1", "H2", "H3", "H4", "H5", "H6"]);

function isBlockElement(node: Node): node is HTMLElement {
  return node.nodeType === Node.ELEMENT_NODE && BLOCK_TAGS.has(node.nodeName);
}

function findContainingBlock(node: Node): HTMLElement {
  let current: Node | null = node;
  while (current) {
    if (isBlockElement(current)) {
      return current;
    }
    current = current.parentElement;
  }
  return document.body;
}

function collectTextBefore(range: Range, limit: number): string {
  const container = findContainingBlock(range.startContainer);
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const texts: string[] = [];

  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    if (
      node === range.startContainer ||
      range.startContainer.contains(node)
    ) {
      const textBefore = node.textContent?.slice(0, range.startOffset) ?? "";
      texts.push(textBefore);
      break;
    }
    texts.push(node.textContent ?? "");
  }

  const combined = texts.join("");
  return combined.slice(-limit);
}

function collectTextAfter(range: Range, limit: number): string {
  const container = findContainingBlock(range.endContainer);
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const texts: string[] = [];
  let pastEnd = false;

  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    if (node === range.endContainer || range.endContainer.contains(node)) {
      const textAfter = node.textContent?.slice(range.endOffset) ?? "";
      texts.push(textAfter);
      pastEnd = true;
      continue;
    }
    if (pastEnd) {
      texts.push(node.textContent ?? "");
    }
  }

  const combined = texts.join("");
  return combined.slice(0, limit);
}

function findNearestHeading(node: Node): string {
  let current: HTMLElement | null =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as HTMLElement)
      : node.parentElement;

  while (current && current !== document.body) {
    if (HEADING_TAGS.has(current.nodeName)) {
      return current.textContent?.trim() ?? "";
    }

    let sibling = current.previousElementSibling;
    while (sibling) {
      if (HEADING_TAGS.has(sibling.nodeName)) {
        return sibling.textContent?.trim() ?? "";
      }
      const nested = sibling.querySelector("h1, h2, h3, h4, h5, h6");
      if (nested) {
        return nested.textContent?.trim() ?? "";
      }
      sibling = sibling.previousElementSibling;
    }

    current = current.parentElement;
  }

  const firstHeading = document.querySelector("h1, h2, h3, h4, h5, h6");
  return firstHeading?.textContent?.trim() ?? "";
}

function detectSourceType(): SourceType {
  if (location.href.endsWith(".pdf")) {
    return "pdf";
  }
  if (document.querySelector('embed[type="application/pdf"]')) {
    return "pdf";
  }
  return "html";
}

export function extractContext(): SelectionContext | null {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    return null;
  }

  const selectedText = selection.toString().trim();
  if (selectedText.length === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const block = findContainingBlock(range.startContainer);

  return {
    selectedText,
    leftContext: collectTextBefore(range, CONTEXT_CHAR_LIMIT),
    rightContext: collectTextAfter(range, CONTEXT_CHAR_LIMIT),
    paragraph: block.textContent?.trim() ?? "",
    heading: findNearestHeading(range.startContainer),
    pageTitle: document.title,
    pageUrl: location.href,
    sourceType: detectSourceType(),
  };
}
