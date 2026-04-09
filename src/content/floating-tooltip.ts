import { truncateText } from "@/lib/utils/text";

let activeTooltip: HTMLDivElement | null = null;

export function showTooltip(x: number, y: number, text: string): void {
  hideTooltip();

  const tooltip = document.createElement("div");
  tooltip.className = "eer-tooltip";

  const arrow = document.createElement("div");
  arrow.className = "eer-tooltip__arrow";
  tooltip.appendChild(arrow);

  const body = document.createElement("div");
  body.className = "eer-tooltip__body";
  body.textContent = text;
  tooltip.appendChild(body);

  document.body.appendChild(tooltip);
  activeTooltip = tooltip;

  // Position after appending so we can measure
  const rect = tooltip.getBoundingClientRect();
  const btnSize = 32;
  const gap = 6;

  let left = x - rect.width / 2;
  let top = y + btnSize + gap;

  // If tooltip would go below viewport, place it to the right of the button instead
  if (top + rect.height > window.innerHeight) {
    top = y - rect.height / 2;
    left = x + btnSize + gap;
    tooltip.classList.add("eer-tooltip--right");
  }

  // Clamp to viewport edges
  if (left + rect.width > window.innerWidth - 4) {
    left = window.innerWidth - rect.width - 4;
  }
  if (left < 4) {
    left = 4;
  }
  if (top < 4) {
    top = 4;
  }

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

export function updateTooltip(text: string): void {
  if (!activeTooltip) return;

  const body = activeTooltip.querySelector(".eer-tooltip__body");
  if (!body) return;

  const preview = truncateText(text, 80);
  body.textContent = "";

  const previewSpan = document.createElement("span");
  previewSpan.className = "eer-tooltip__preview";
  previewSpan.textContent = preview;
  body.appendChild(previewSpan);

  const link = document.createElement("span");
  link.className = "eer-tooltip__link";
  link.textContent = "View in panel \u2192";
  body.appendChild(link);

  activeTooltip.classList.add("eer-tooltip--active");
}

export function hideTooltip(): void {
  if (activeTooltip) {
    activeTooltip.remove();
    activeTooltip = null;
  }
}
