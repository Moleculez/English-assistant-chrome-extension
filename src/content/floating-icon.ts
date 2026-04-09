const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none"><rect width="128" height="128" rx="28" fill="#6366f1"/><path d="M28 42C28 39 30 37 33 37L60 37C62 37 62 37 62 39L62 92C62 94 60 94 58 93C52 90 42 88 33 88C30 88 28 86 28 84Z" fill="white" opacity="0.9"/><path d="M66 39C66 37 66 37 68 37L95 37C98 37 100 39 100 42L100 84C100 86 98 88 95 88C86 88 76 90 70 93C68 94 66 94 66 92Z" fill="white"/><g transform="translate(94,28)"><path d="M0-10C1-3 3-1 10 0 3 1 1 3 0 10-1 3-3 1-10 0-3-1-1-3 0-10Z" fill="#fbbf24"/></g></svg>`;

let activeButton: HTMLButtonElement | null = null;
let buttonPosition: { left: number; top: number } | null = null;

export function getButtonPosition(): { left: number; top: number } | null {
  return buttonPosition;
}

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
  buttonPosition = { left, top };

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
    buttonPosition = null;
  }
}
