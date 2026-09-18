export {};

type ScrollDetail = { velocity: number };

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

function splitWords(element: HTMLElement) {
  let index = 0;
  // The split markup is presentational; the heading keeps its plain text as its accessible name.
  element.setAttribute("aria-label", (element.textContent ?? "").replace(/\s+/g, " ").trim());

  const makeWord = (content: string) => {
    const outer = document.createElement("span");
    outer.className = "split-w";
    outer.setAttribute("aria-hidden", "true");
    const inner = document.createElement("span");
    inner.className = "split-i";
    inner.style.setProperty("--i", String(index++));
    for (const char of content) {
      const letter = document.createElement("span");
      letter.className = "split-c";
      letter.textContent = char;
      inner.append(letter);
    }
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

/** Letters near the pointer lift and warm to gold, the way the hero name reacts. */
function liftLetters(title: HTMLElement) {
  const letters = [...title.querySelectorAll<HTMLElement>(".split-c")];
  if (letters.length === 0) return;
  let centers: { x: number; y: number }[] = [];
  let applied = letters.map(() => 0);
  let frame = 0;
  let pointer = { x: 0, y: 0 };

  const measure = () => {
    centers = letters.map((letter) => {
      const rect = letter.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    });
  };

  const paint = () => {
    frame = 0;
    // A scroll between the pointer event and this frame clears the cached centres.
    if (centers.length !== letters.length) measure();
    const reach = Math.max(90, title.getBoundingClientRect().height * 0.9);
    letters.forEach((letter, i) => {
      const center = centers[i]!;
      const raw = Math.max(0, 1 - Math.hypot(pointer.x - center.x, pointer.y - center.y) / reach);
      const lift = Math.round(raw * raw * (3 - 2 * raw) * 10) / 10;
      if (lift !== applied[i]) {
        applied[i] = lift;
        letter.style.setProperty("--lift", String(lift));
      }
    });
  };

  const reset = () => {
    letters.forEach((letter) => letter.style.removeProperty("--lift"));
    applied = letters.map(() => 0);
  };

  title.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "mouse") return;
    measure();
  });
  title.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    if (centers.length === 0) measure();
    pointer = { x: event.clientX, y: event.clientY };
    if (!frame) frame = requestAnimationFrame(paint);
  });
  title.addEventListener("pointerleave", () => {
    cancelAnimationFrame(frame);
    frame = 0;
    centers = [];
    reset();
  });
  window.addEventListener("scroll", () => (centers = []), { passive: true });
}

/** Button and link labels roll up to a copy of themselves on hover. */
function rollLabel(element: HTMLElement) {
  if (element.closest("dialog") || element.querySelector(".roll")) return;
  const wrap = (text: string) => {
    const roll = document.createElement("span");
    roll.className = "roll";
    const a = document.createElement("span");
    a.className = "roll__a";
    a.textContent = text;
    const b = document.createElement("span");
    b.className = "roll__b";
    b.setAttribute("aria-hidden", "true");
    b.textContent = text;
    roll.append(a, b);
    return roll;
  };
  for (const node of [...element.childNodes]) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      element.replaceChild(wrap(node.textContent.trim()), node);
    } else if (node instanceof HTMLSpanElement && !node.className && node.children.length === 0 && node.textContent?.trim()) {
      const text = node.textContent.trim();
      node.textContent = "";
      node.append(wrap(text));
    }
  }
}

if (!reducedMotion) {
  document.querySelectorAll<HTMLElement>("[data-split]").forEach(splitWords);

  if (finePointer) {
    document.querySelectorAll<HTMLElement>("[data-split]").forEach(liftLetters);
    document.querySelectorAll<HTMLElement>(".btn, .nav__links a, .site-footer__nav a").forEach(rollLabel);

    // Cards light up where the pointer is.
    const SPOT = ".panel, .tile, .work-card, .award-feature";
    let spotted: HTMLElement | null = null;
    document.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType !== "mouse") return;
        const card = (event.target as Element).closest<HTMLElement>(SPOT);
        if (card !== spotted) {
          spotted?.classList.remove("is-spot");
          spotted = card;
          card?.classList.add("is-spot");
        }
        if (!card) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${Math.round(event.clientX - rect.left)}px`);
        card.style.setProperty("--my", `${Math.round(event.clientY - rect.top)}px`);
      },
      { passive: true },
    );
    document.documentElement.addEventListener("pointerleave", () => {
      spotted?.classList.remove("is-spot");
      spotted = null;
    });
  }

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

// The contact medallion flips on hover; on touch screens a tap flips it.
document.querySelectorAll<HTMLElement>(".medallion").forEach((medallion) => {
  medallion.addEventListener("click", () => medallion.classList.toggle("is-flipped"));
});
