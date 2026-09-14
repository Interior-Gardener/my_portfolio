export {};

type PointerDetail = { x: number; y: number; active: boolean };

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const POINTER_IDLE_MS = 2500;

const title = document.querySelector<HTMLElement>("[data-kinetic]");
if (title && !reducedMotion) {
  const chars = [...title.querySelectorAll<HTMLElement>(".k-char")];
  const state = chars.map((_, index) => ({
    weight: 700,
    width: 90,
    appliedWeight: 700,
    appliedWidth: 90,
    rest: ((Math.sin(-index * 0.55) + 1) / 2) * 0.6,
  }));
  const pointer = { x: -1e4, y: -1e4, movedAt: -Infinity };
  let visible = true;
  let raf = 0;

  const schedule = () => {
    if (!raf && visible) raf = requestAnimationFrame(tick);
  };

  const onPointer = (x: number, y: number) => {
    pointer.x = x;
    pointer.y = y;
    pointer.movedAt = performance.now();
    schedule();
  };

  function tick(now: number) {
    raf = 0;
    const active = now - pointer.movedAt <= POINTER_IDLE_MS;
    const rects = active ? chars.map((char) => char.getBoundingClientRect()) : null;
    let settling = false;

    chars.forEach((char, index) => {
      const current = state[index]!;
      let t = current.rest;
      if (rects) {
        const rect = rects[index]!;
        const d = Math.hypot(pointer.x - (rect.left + rect.width / 2), pointer.y - (rect.top + rect.height / 2));
        const raw = Math.max(0, 1 - d / 340);
        t = Math.max(current.rest * 0.5, raw * raw * (3 - 2 * raw));
      }

      const targetWeight = 330 + t * 470;
      const targetWidth = 75 + t * 25;
      current.weight += (targetWeight - current.weight) * 0.16;
      current.width += (targetWidth - current.width) * 0.16;
      if (Math.abs(targetWeight - current.weight) > 1 || Math.abs(targetWidth - current.width) > 0.1) settling = true;

      const weight = Math.round(current.weight / 20) * 20;
      const width = Math.round(current.width / 2.5) * 2.5;
      if (weight !== current.appliedWeight) {
        current.appliedWeight = weight;
        char.style.setProperty("--w", String(weight));
      }
      if (width !== current.appliedWidth) {
        current.appliedWidth = width;
        char.style.setProperty("--wd", String(width));
      }
    });

    if (active || settling) schedule();
  }

  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "touch") onPointer(event.clientX, event.clientY);
    },
    { passive: true },
  );
  window.addEventListener("signal:pointer", (event) => {
    const detail = (event as CustomEvent<PointerDetail>).detail;
    if (detail.active) onPointer(detail.x, detail.y);
  });

  new IntersectionObserver(([entry]) => {
    visible = Boolean(entry?.isIntersecting);
    if (visible) schedule();
  }).observe(title);

  schedule();
}

const rotator = document.querySelector<HTMLElement>("[data-rotator]");
if (rotator && !reducedMotion) {
  const items = [...rotator.children] as HTMLElement[];
  const interactionEvents = ["pointermove", "pointerdown", "scroll", "keydown", "touchstart"] as const;
  let index = 0;
  let timer = 0;
  let started = false;

  const advance = () => {
    const current = items[index]!;
    index = (index + 1) % items.length;
    const next = items[index]!;
    current.classList.remove("is-active");
    current.classList.add("is-leaving");
    next.classList.remove("is-leaving");
    next.classList.add("is-active");
    window.setTimeout(() => current.classList.remove("is-leaving"), 850);
  };

  const run = () => {
    window.clearInterval(timer);
    timer = window.setInterval(advance, 3000);
  };

  const start = () => {
    if (started) return;
    started = true;
    interactionEvents.forEach((name) => window.removeEventListener(name, start));
    run();
  };

  if (items.length > 1) {
    interactionEvents.forEach((name) => window.addEventListener(name, start, { passive: true }));
    document.addEventListener("visibilitychange", () => {
      if (!started) return;
      if (document.hidden) window.clearInterval(timer);
      else run();
    });
  }
}
