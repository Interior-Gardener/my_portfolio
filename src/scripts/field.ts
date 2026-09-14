export {};

type PointerDetail = { x: number; y: number; active: boolean };

const canvas = document.querySelector<HTMLCanvasElement>("[data-signal-field]");
const context = canvas?.getContext("2d");

if (canvas && context) {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const ctx = context;

  let width = 0;
  let height = 0;
  let spacing = 30;
  let dotColor = "rgba(236,238,241,.13)";
  let hotColor = "#cdfb45";
  let frame = 0;
  let lastFrameAt = 0;
  let lastPointerAt = -Infinity;

  const pointer = { x: -9999, y: -9999, targetX: -9999, targetY: -9999, strength: 0, active: false };

  const readColors = () => {
    const styles = getComputedStyle(document.documentElement);
    dotColor = styles.getPropertyValue("--field-dot").trim() || dotColor;
    hotColor = styles.getPropertyValue("--field-hot").trim() || hotColor;
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    spacing = width < 640 ? 24 : 30;
  };

  const draw = (time: number) => {
    ctx.clearRect(0, 0, width, height);

    pointer.x += (pointer.targetX - pointer.x) * 0.16;
    pointer.y += (pointer.targetY - pointer.y) * 0.16;
    const goal = pointer.active ? 1 : 0;
    pointer.strength += (goal - pointer.strength) * 0.06;

    const radius = Math.max(140, Math.min(width, height) * 0.24);
    const offsetY = -((window.scrollY * 0.35) % spacing);
    const cols = Math.ceil(width / spacing) + 1;
    const rows = Math.ceil(height / spacing) + 2;
    const hot: [number, number, number, number][] = [];

    ctx.fillStyle = dotColor;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let x = col * spacing + (row % 2 ? spacing / 2 : 0);
        let y = row * spacing + offsetY;
        const wave = Math.sin(x * 0.011 + time * 0.00055) * Math.cos(y * 0.013 - time * 0.00045);
        let size = 1 + wave * 0.45;

        if (pointer.strength > 0.01) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < radius) {
            const falloff = 1 - dist / radius;
            const force = falloff * falloff * pointer.strength;
            const push = force * 16;
            x += (dx / (dist || 1)) * push;
            y += (dy / (dist || 1)) * push;
            size += force * 2.2;
            if (force > 0.04) {
              hot.push([x, y, size, Math.min(1, force * 1.6)]);
              continue;
            }
          }
        }
        const half = Math.max(0.4, size);
        ctx.fillRect(x - half, y - half, half * 2, half * 2);
      }
    }

    ctx.fillStyle = hotColor;
    for (const [x, y, size, alpha] of hot) {
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  const loop = (time: number) => {
    frame = requestAnimationFrame(loop);
    const idle = time - lastPointerAt > 2000 && pointer.strength < 0.02;
    if (idle && time - lastFrameAt < 33) return;
    lastFrameAt = time;
    draw(time);
  };

  const start = () => {
    cancelAnimationFrame(frame);
    if (reducedMotion.matches) {
      draw(0);
      return;
    }
    frame = requestAnimationFrame(loop);
  };

  const setPointer = (x: number, y: number, active: boolean) => {
    pointer.targetX = x;
    pointer.targetY = y;
    if (pointer.x < -9000) {
      pointer.x = x;
      pointer.y = y;
    }
    pointer.active = active;
    lastPointerAt = performance.now();
    if (reducedMotion.matches) draw(0);
  };

  const boot = () => {
    readColors();
    resize();
    start();
    canvas.classList.add("is-ready");
  };
  const whenIdle = () => {
    if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(boot, { timeout: 1500 });
    else window.setTimeout(boot, 300);
  };
  if (document.readyState === "complete") whenIdle();
  else window.addEventListener("load", whenIdle, { once: true });

  window.addEventListener("resize", () => {
    resize();
    if (reducedMotion.matches) draw(0);
  });
  window.addEventListener("themechange", () => {
    readColors();
    if (reducedMotion.matches) draw(0);
  });
  window.addEventListener("pointermove", (event) => setPointer(event.clientX, event.clientY, true), { passive: true });
  document.documentElement.addEventListener("pointerleave", () => {
    pointer.active = false;
  });
  window.addEventListener("signal:pointer", (event) => {
    const detail = (event as CustomEvent<PointerDetail>).detail;
    setPointer(detail.x, detail.y, detail.active);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(frame);
    else start();
  });
  reducedMotion.addEventListener("change", start);
}
