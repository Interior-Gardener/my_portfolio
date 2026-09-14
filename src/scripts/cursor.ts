export {};

const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const cursor = document.querySelector<HTMLElement>("[data-cursor-root]");

const INTERACTIVE = "a[href], button, [role='button'], [role='tab'], summary, label[for]";
const TEXT_ENTRY = "input, textarea, select, [contenteditable='true'], object, iframe";

if (cursor && finePointer.matches) initCursor(cursor);

function initCursor(cursor: HTMLElement) {
  const root = document.documentElement;
  const ring = cursor.querySelector<HTMLElement>("[data-cursor-ring]")!;
  const shape = cursor.querySelector<HTMLElement>("[data-cursor-shape]")!;
  const dot = cursor.querySelector<HTMLElement>("[data-cursor-dot]")!;
  const label = cursor.querySelector<HTMLElement>("[data-cursor-label]")!;

  const mouse = { x: -200, y: -200 };
  const trail = { x: -200, y: -200 };
  let raf = 0;
  let visible = false;

  root.classList.add("has-cursor");

  const setMode = (mode: "default" | "hover" | "label" | "hidden", text = "") => {
    cursor.dataset.mode = mode;
    label.textContent = text;
  };

  const loop = () => {
    const ease = reducedMotion ? 1 : 0.19;
    const dx = mouse.x - trail.x;
    const dy = mouse.y - trail.y;
    trail.x += dx * ease;
    trail.y += dy * ease;

    const speed = Math.min(1, Math.hypot(dx, dy) / 140);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
    ring.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0)`;
    shape.style.transform = `rotate(${angle.toFixed(1)}deg) scale(${(1 + speed * 0.32).toFixed(3)}, ${(1 - speed * 0.22).toFixed(3)})`;

    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) raf = requestAnimationFrame(loop);
    else raf = 0;
  };

  const wake = () => {
    if (!raf) raf = requestAnimationFrame(loop);
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      if (!visible) {
        visible = true;
        trail.x = mouse.x;
        trail.y = mouse.y;
        cursor.classList.add("is-visible");
      }
      wake();
    },
    { passive: true },
  );

  document.addEventListener("pointerover", (event) => {
    const target = event.target as Element;
    if (target.closest(TEXT_ENTRY)) return setMode("hidden");
    const labelled = target.closest<HTMLElement>("[data-cursor]");
    if (labelled) return setMode("label", labelled.dataset.cursor ?? "");
    if (target.closest(INTERACTIVE)) return setMode("hover");
    setMode("default");
  });

  root.addEventListener("pointerleave", () => {
    visible = false;
    cursor.classList.remove("is-visible");
  });
  window.addEventListener("pointerdown", () => cursor.classList.add("is-down"));
  window.addEventListener("pointerup", () => cursor.classList.remove("is-down"));

  // Dialogs render in the top layer and Gesture Mode draws its own pointer,
  // so both hand control back to the native mouse cursor.
  const syncNativeCursor = () => {
    const suspended = document.querySelector("dialog[open]") !== null || root.classList.contains("gesture-active");
    if (root.classList.contains("has-cursor") === suspended) root.classList.toggle("has-cursor", !suspended);
    cursor.classList.toggle("is-suspended", suspended);
  };
  new MutationObserver(syncNativeCursor).observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] });
  new MutationObserver(syncNativeCursor).observe(root, { attributes: true, attributeFilter: ["class"] });

  if (reducedMotion) return;

  document.querySelectorAll<HTMLElement>(".btn, .icon-btn, [data-magnetic]").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - (rect.left + rect.width / 2)) * 0.22;
      const y = (event.clientY - (rect.top + rect.height / 2)) * 0.32;
      element.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
    });
    element.addEventListener("pointerleave", () => {
      element.style.translate = "";
    });
  });
}
