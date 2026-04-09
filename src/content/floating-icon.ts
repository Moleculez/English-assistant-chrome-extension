const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`;

let activeButton: HTMLButtonElement | null = null;

export function showFloatingIcon(
  x: number,
  y: number,
  onClick: () => void
): void {
  hideFloatingIcon();

  const btn = document.createElement("button");
  btn.className = "eer-floating-btn";
  btn.innerHTML = ICON_SVG;
  btn.setAttribute("aria-label", "Simplify selected text");

  const offsetY = 8;
  const offsetX = 8;
  const btnSize = 32;

  let left = x + offsetX;
  let top = y - btnSize - offsetY;

  if (left + btnSize > window.innerWidth) {
    left = window.innerWidth - btnSize - 4;
  }
  if (left < 0) {
    left = 4;
  }
  if (top < 0) {
    top = y + offsetY;
  }

  btn.style.left = `${left}px`;
  btn.style.top = `${top}px`;

  btn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  });

  document.body.appendChild(btn);
  activeButton = btn;
}

export function hideFloatingIcon(): void {
  if (activeButton) {
    activeButton.remove();
    activeButton = null;
  }
}
