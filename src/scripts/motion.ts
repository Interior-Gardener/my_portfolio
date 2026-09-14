export {};

type ScrollDetail = { velocity: number };

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

function splitWords(element: HTMLElement) {
  let index = 0;

  const makeWord = (content: string) => {
    const outer = document.createElement("span");
    outer.className = "split-w";
    const inner = document.createElement("span");
    inner.className = "split-i";
    inner.style.setProperty("--i", String(index++));
    inner.textContent = content;
    outer.append(inner);
    return outer;
  };

  const walk = (parent: Node) => {
    for (const node of [...parent.childNodes]) {
      if (node.nodeType === Node.TEXT_NODE) {
        const fragment = document.createDocumentFragment();
        for (const part of (node.textContent ?? "").split(/(\s+)/)) {
          if (!part) continue;
          fragment.append(/^\s+$/.test(part) ? document.createTextNode(part) : makeWord(part));
        }
        parent.replaceChild(fragment, node);
      } else if (node instanceof HTMLElement && node.tagName !== "BR") {
        walk(node);
      }
    }
  };

  walk(element);
  element.classList.add("is-split");
}

if (!reducedMotion) {
  document.querySelectorAll<HTMLElement>("[data-split]").forEach(splitWords);

  const parallaxItems = [...document.querySelectorAll<HTMLElement>("[data-parallax]")];
  const marquee = document.querySelector<HTMLElement>(".marquee");
  let skew = 0;
  let targetSkew = 0;
  let frame = 0;

  const update = () => {
    frame = 0;
    const viewportCenter = window.innerHeight / 2;
    for (const item of parallaxItems) {
      const rect = item.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) continue;
      const offset = (rect.top + rect.height / 2 - viewportCenter) * -0.06;
      item.style.translate = `0 ${offset.toFixed(1)}px`;
    }

    targetSkew *= 0.9;
    skew += (targetSkew - skew) * 0.15;
    if (marquee) marquee.style.setProperty("--skew", `${skew.toFixed(2)}deg`);
    if (Math.abs(skew) > 0.02 || Math.abs(targetSkew) > 0.02) schedule();
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  window.addEventListener("smooth:scroll", (event) => {
    const { velocity } = (event as CustomEvent<ScrollDetail>).detail;
    targetSkew = Math.max(-8, Math.min(8, velocity * 0.35));
    schedule();
  });
  schedule();

  if (finePointer) {
    document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((element) => {
      const state = { rx: 0, ry: 0, tx: 0, ty: 0 };
      let tiltFrame = 0;

      const tick = () => {
        tiltFrame = 0;
        state.rx += (state.tx - state.rx) * 0.1;
        state.ry += (state.ty - state.ry) * 0.1;
        element.style.setProperty("--rx", `${state.rx.toFixed(2)}deg`);
        element.style.setProperty("--ry", `${state.ry.toFixed(2)}deg`);
        if (Math.abs(state.tx - state.rx) > 0.02 || Math.abs(state.ty - state.ry) > 0.02) tiltFrame = requestAnimationFrame(tick);
      };

      window.addEventListener(
        "pointermove",
        (event) => {
          const rect = element.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const range = Math.max(rect.width, 520);
          const nx = Math.max(-1, Math.min(1, (event.clientX - cx) / range));
          const ny = Math.max(-1, Math.min(1, (event.clientY - cy) / range));
          state.ty = nx * 14;
          state.tx = -ny * 14;
          if (!tiltFrame) tiltFrame = requestAnimationFrame(tick);
        },
        { passive: true },
      );
    });
  }
}
