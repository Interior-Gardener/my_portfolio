import { toast } from "./toast";

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const nav = document.querySelector<HTMLElement>("[data-nav]");
if (nav) {
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 16);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const menuButton = nav.querySelector<HTMLButtonElement>("[data-menu-button]");
  const sheet = nav.querySelector<HTMLElement>("[data-menu-sheet]");
  if (menuButton && sheet) {
    const setOpen = (open: boolean) => {
      menuButton.setAttribute("aria-expanded", String(open));
      sheet.hidden = !open;
    };
    menuButton.addEventListener("click", () => setOpen(menuButton.getAttribute("aria-expanded") !== "true"));
    sheet.addEventListener("click", (event) => {
      if ((event.target as Element).closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
    document.addEventListener("click", (event) => {
      if (!nav.contains(event.target as Node)) setOpen(false);
    });
  }

  const links = [...nav.querySelectorAll<HTMLAnchorElement>("[data-section-link]")];
  const sections = links
    .map((link) => document.getElementById(link.dataset.sectionLink ?? ""))
    .filter((section): section is HTMLElement => section !== null);
  if (sections.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          for (const link of links) {
            if (link.dataset.sectionLink === entry.target.id) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          }
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
  }
}

const animateCount = (element: HTMLElement) => {
  const target = element.dataset.count ?? "";
  const value = Number.parseFloat(target);
  if (Number.isNaN(value) || reducedMotion) {
    element.textContent = target;
    return;
  }
  const decimals = target.includes(".") ? target.split(".")[1]!.length : 0;
  const duration = 1400;
  const start = performance.now();
  const step = (now: number) => {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(2, -10 * progress);
    element.textContent = (value * (progress === 1 ? 1 : eased)).toFixed(decimals);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const openDialog = [...document.querySelectorAll<HTMLDialogElement>("dialog[open]")].pop();
  if (!openDialog) return;
  event.preventDefault();
  openDialog.close();
});

const revealTargets = document.querySelectorAll<HTMLElement>("[data-reveal]");
const counters = document.querySelectorAll<HTMLElement>("[data-count]");
if ("IntersectionObserver" in window && !reducedMotion) {
  document.documentElement.classList.add("reveal-ready");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        revealObserver.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );
  revealTargets.forEach((element) => revealObserver.observe(element));

  const countObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        animateCount(entry.target as HTMLElement);
        countObserver.unobserve(entry.target);
      }
    },
    { threshold: 0.6 },
  );
  counters.forEach((element) => countObserver.observe(element));
} else {
  revealTargets.forEach((element) => element.classList.add("is-in"));
}

const clocks = document.querySelectorAll<HTMLElement>("[data-clock]");
if (clocks.length > 0) {
  const format = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });
  const tickClock = () => clocks.forEach((clock) => (clock.textContent = format.format(new Date())));
  tickClock();
  window.setInterval(tickClock, 20_000);
}

document.addEventListener("click", async (event) => {
  const trigger = (event.target as Element).closest<HTMLElement>("[data-copy]");
  if (!trigger) return;
  const text = trigger.dataset.copy ?? "";
  try {
    await navigator.clipboard.writeText(text);
    toast("Email copied to clipboard");
  } catch {
    toast(`Copy failed. The email is ${text}`);
  }
});

const toastElement = document.querySelector<HTMLElement>("[data-toast]");
if (toastElement) {
  let hideTimer = 0;
  window.addEventListener("toast", (event) => {
    toastElement.textContent = (event as CustomEvent<string>).detail;
    toastElement.classList.add("is-visible");
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => toastElement.classList.remove("is-visible"), 2600);
  });
}

const workCards = [...document.querySelectorAll<HTMLElement>("[data-work-card]")];
if (workCards.length > 1) {
  const desktop = matchMedia("(min-width: 961px)");
  let raf = 0;
  const update = () => {
    raf = 0;
    if (!desktop.matches || reducedMotion) {
      workCards.forEach((card) => card.style.removeProperty("--recede"));
      return;
    }
    workCards.forEach((card, index) => {
      const next = workCards[index + 1];
      if (!next) return;
      const rect = card.getBoundingClientRect();
      const overlap = (rect.bottom - next.getBoundingClientRect().top) / rect.height;
      card.style.setProperty("--recede", Math.min(1, Math.max(0, overlap)).toFixed(3));
    });
  };
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };
  schedule();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
}

const timeline = document.querySelector<HTMLElement>("[data-timeline]");
if (timeline) {
  let raf = 0;
  const update = () => {
    raf = 0;
    const rect = timeline.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, (window.innerHeight * 0.62 - rect.top) / rect.height));
    timeline.style.setProperty("--progress", progress.toFixed(4));
  };
  requestAnimationFrame(update);
  window.addEventListener(
    "scroll",
    () => {
      if (!raf) raf = requestAnimationFrame(update);
    },
    { passive: true },
  );
  window.addEventListener("resize", update);
}

const skills = document.querySelector<HTMLElement>("[data-skills]");
if (skills) {
  const chips = [...skills.querySelectorAll<HTMLButtonElement>("[data-skill]")];
  const items = [...skills.querySelectorAll<HTMLElement>("[data-skill-item]")];
  const heading = skills.querySelector<HTMLElement>("[data-skill-heading]");
  const empty = skills.querySelector<HTMLElement>("[data-skill-empty]");
  const clear = skills.querySelector<HTMLButtonElement>("[data-skill-clear]");
  let active: HTMLButtonElement | null = null;

  const render = () => {
    const id = active?.dataset.skill ?? null;
    chips.forEach((chip) => chip.setAttribute("aria-pressed", String(chip === active)));
    let shown = 0;
    items.forEach((item) => {
      const match = !id || (item.dataset.skills ?? "").split(" ").includes(id);
      item.hidden = !match;
      if (match) shown += 1;
    });
    if (heading) heading.textContent = active ? `Where I've used ${active.dataset.skillName}` : "Everything shipped, across every skill";
    if (empty) empty.hidden = shown > 0;
    if (clear) clear.hidden = !active;
  };

  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      active = active === chip ? null : chip;
      render();
    }),
  );
  clear?.addEventListener("click", () => {
    active = null;
    render();
  });
  render();
}

const lightbox = document.querySelector<HTMLDialogElement>("[data-lightbox]");
if (lightbox) {
  const image = lightbox.querySelector<HTMLImageElement>("img");
  const caption = lightbox.querySelector<HTMLElement>("figcaption");
  document.addEventListener("click", (event) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>("a[data-lightbox-trigger]");
    if (!link || !image || !caption) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    image.src = link.href;
    image.alt = link.dataset.alt ?? "";
    caption.textContent = link.dataset.caption ?? "";
    caption.hidden = !link.dataset.caption;
    lightbox.showModal();
  });
  lightbox.addEventListener("click", (event) => {
    const target = event.target as Element;
    if (target === lightbox || target.closest("[data-lightbox-close]")) lightbox.close();
  });
  lightbox.addEventListener("close", () => image?.removeAttribute("src"));
}

const tabs = [...document.querySelectorAll<HTMLButtonElement>("[data-resume-tab]")];
if (tabs.length > 0) {
  const select = (tab: HTMLButtonElement) => {
    for (const other of tabs) {
      const selected = other === tab;
      other.setAttribute("aria-selected", String(selected));
      other.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(other.getAttribute("aria-controls") ?? "");
      if (panel) panel.hidden = !selected;
    }
    const frame = document.querySelector<HTMLObjectElement>("[data-pdf-frame]");
    if (tab.dataset.resumeTab === "pdf" && frame && !frame.getAttribute("data")) {
      frame.setAttribute("data", frame.dataset.src ?? "");
    }
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      const next = tabs[(index + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length]!;
      next.focus();
      select(next);
    });
  });
}

document.querySelectorAll<HTMLButtonElement>("[data-print]").forEach((button) => {
  button.addEventListener("click", () => window.print());
});
