export {};

declare global {
  interface Window {
    __kvPreloaderStarted?: boolean;
  }
}

const SESSION_KEY = "kv-intro-seen";
const MIN_DURATION_MS = 1900;

const root = document.documentElement;
const preloader = document.querySelector<HTMLElement>("[data-preloader]");

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));
const settle = (task: Promise<unknown>, ms: number) => Promise.race([task.then(() => undefined, () => undefined), wait(ms)]);

if (preloader && root.classList.contains("is-preloading")) {
  window.__kvPreloaderStarted = true;
  void run(preloader);
} else {
  preloader?.remove();
}

async function run(preloader: HTMLElement) {
  const count = preloader.querySelector<HTMLElement>("[data-preloader-count]");
  const ring = preloader.querySelector<SVGCircleElement>("[data-preloader-ring]");
  const logo = preloader.querySelector<HTMLImageElement>("[data-preloader-logo]");
  const startedAt = performance.now();

  const tasks = [
    settle(document.fonts.ready, 3500),
    settle(logo ? logo.decode() : Promise.resolve(), 3500),
    settle(new Promise<void>((resolve) => window.addEventListener("bg:ready", () => resolve(), { once: true })), 4000),
    settle(
      new Promise<void>((resolve) => {
        if (document.readyState === "complete") resolve();
        else window.addEventListener("load", () => resolve(), { once: true });
      }),
      6000,
    ),
  ];

  let completed = 0;
  let allDone = false;
  tasks.forEach((task) => void task.then(() => (completed += 1)));
  void Promise.all(tasks).then(() => (allDone = true));

  await new Promise<void>((resolve) => {
    let shown = 0;
    const step = (now: number) => {
      const timeProgress = Math.min(1, (now - startedAt) / MIN_DURATION_MS);
      const taskProgress = allDone ? 1 : (completed / tasks.length) * 0.92;
      const target = Math.min(timeProgress, taskProgress);
      shown += (target - shown) * 0.09;
      if (count) count.textContent = String(Math.min(100, Math.round(shown * 100)));
      ring?.style.setProperty("stroke-dashoffset", String(100 - shown * 100));
      if (allDone && timeProgress >= 1 && shown > 0.995) {
        if (count) count.textContent = "100";
        ring?.style.setProperty("stroke-dashoffset", "0");
        resolve();
        return;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });

  preloader.classList.add("is-complete");
  await wait(380);

  const brand = document.querySelector<HTMLElement>("[data-brand-logo]");
  if (logo && brand) {
    const from = logo.getBoundingClientRect();
    const to = brand.getBoundingClientRect();
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    logo.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${to.width / from.width})`;
    preloader.style.setProperty("--ox", `${to.left + to.width / 2}px`);
    preloader.style.setProperty("--oy", `${to.top + to.height / 2}px`);
    preloader.style.setProperty("--r-end", `${to.width / 2}px`);
  }

  preloader.classList.add("is-leaving");
  root.classList.remove("is-preloading");
  window.dispatchEvent(new Event("preloader:done"));

  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    /* storage may be unavailable; the intro simply plays again next time */
  }

  await wait(1150);
  preloader.remove();
}
