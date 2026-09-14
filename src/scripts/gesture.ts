import type { HandLandmarker } from "@mediapipe/tasks-vision";
import { createGestureStabilizer, type Gesture, type GestureOutcome } from "./gesture-classifier";
import { toast } from "./toast";

const SESSION_KEY = "gesture-mode";
const LABELS: Record<Gesture, string> = {
  cursor_move: "Open palm · moving",
  click: "OK sign · click",
  thumbs_up: "Thumbs up · scrolling up",
  thumbs_down: "Thumbs down · scrolling down",
  rotate_left: "Peace left · previous section",
  rotate_right: "Peace right · next section",
  pinch: "Pinch",
  zoom: "Zoom pose",
  index_point: "Pointing",
  unknown: "Show an open palm",
};

let landmarkerPromise: Promise<HandLandmarker> | null = null;

function loadLandmarker(): Promise<HandLandmarker> {
  landmarkerPromise ??= (async () => {
    const { FilesetResolver, HandLandmarker } = await import("@mediapipe/tasks-vision");
    const fileset = await FilesetResolver.forVisionTasks("/mediapipe/wasm");
    return HandLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: "/mediapipe/hand_landmarker.task", delegate: "GPU" },
      runningMode: "VIDEO",
      numHands: 1,
      minHandDetectionConfidence: 0.7,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.7,
    });
  })().catch((error: unknown) => {
    landmarkerPromise = null;
    throw error;
  });
  return landmarkerPromise;
}

const hud = document.querySelector<HTMLElement>("[data-gesture-hud]");
const intro = document.querySelector<HTMLDialogElement>("[data-gesture-intro]");
const cursor = document.querySelector<HTMLElement>("[data-gesture-cursor]");

if (hud && intro && cursor) setupGestures(hud, intro, cursor);

function setupGestures(hud: HTMLElement, intro: HTMLDialogElement, cursor: HTMLElement) {
  const video = hud.querySelector<HTMLVideoElement>("video")!;
  const status = hud.querySelector<HTMLElement>("[data-gesture-status]")!;
  const fpsLabel = hud.querySelector<HTMLElement>("[data-gesture-fps]")!;
  const toggles = [...document.querySelectorAll<HTMLButtonElement>("[data-gesture-toggle]")];

  let state: "idle" | "starting" | "running" = "idle";
  let stream: MediaStream | null = null;
  let landmarker: HandLandmarker | null = null;
  let stabilizer = createGestureStabilizer();
  let raf = 0;
  let lastVideoTime = -1;
  let frames = 0;
  let fpsWindowStart = performance.now();
  let lastScrollAt = 0;
  let lastSectionJumpAt = 0;
  const point = { x: window.innerWidth / 2, y: window.innerHeight / 2, visible: false };

  const setToggles = (on: boolean) => {
    document.documentElement.classList.toggle("gesture-active", on);
    toggles.forEach((toggle) => {
      toggle.setAttribute("aria-pressed", String(on));
      toggle.setAttribute("aria-label", on ? "Turn off Gesture Mode" : "Turn on Gesture Mode");
    });
  };

  const hideCursor = () => {
    if (!point.visible) return;
    point.visible = false;
    cursor.classList.remove("is-visible");
    window.dispatchEvent(new CustomEvent("signal:pointer", { detail: { x: point.x, y: point.y, active: false } }));
  };

  const moveCursor = (nx: number, ny: number) => {
    const x = Math.min(1, Math.max(0, (nx - 0.15) / 0.7)) * window.innerWidth;
    const y = Math.min(1, Math.max(0, (ny - 0.12) / 0.62)) * window.innerHeight;
    point.x += (x - point.x) * 0.55;
    point.y += (y - point.y) * 0.55;
    cursor.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
    if (!point.visible) {
      point.visible = true;
      cursor.classList.add("is-visible");
    }
    window.dispatchEvent(new CustomEvent("signal:pointer", { detail: { x: point.x, y: point.y, active: true } }));
  };

  const clickAtCursor = () => {
    cursor.classList.remove("is-click");
    void cursor.offsetWidth;
    cursor.classList.add("is-click");
    if (!point.visible) return;
    const target = document
      .elementFromPoint(point.x, point.y)
      ?.closest<HTMLElement>("a[href], button, [role='button'], [role='tab'], summary, label, input, textarea");
    if (!target) return;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) target.focus();
    else target.click();
  };

  const scrollPage = (direction: 1 | -1) => {
    const now = performance.now();
    if (now - lastScrollAt < 160) return;
    lastScrollAt = now;
    window.scrollBy({ top: direction * window.innerHeight * 0.12, behavior: "auto" });
  };

  const jumpSection = (direction: 1 | -1) => {
    const now = performance.now();
    if (now - lastSectionJumpAt < 1200) return;
    lastSectionJumpAt = now;
    const sections = [...document.querySelectorAll<HTMLElement>("main section")];
    const tops = sections.map((section) => section.getBoundingClientRect().top);
    const target =
      direction === 1
        ? sections.find((_, index) => tops[index]! > 80)
        : [...sections].reverse().find((section) => section.getBoundingClientRect().top < -80);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handle = (outcome: GestureOutcome) => {
    if (outcome.cursor) {
      if (outcome.cursor.x === null || outcome.cursor.y === null) {
        hideCursor();
        status.textContent = "Show your hand to the camera";
      } else {
        moveCursor(outcome.cursor.x, outcome.cursor.y);
      }
    }
    if (!outcome.gesture) return;
    status.textContent = LABELS[outcome.gesture];
    switch (outcome.gesture) {
      case "click":
        clickAtCursor();
        break;
      case "thumbs_up":
        scrollPage(-1);
        break;
      case "thumbs_down":
        scrollPage(1);
        break;
      case "rotate_right":
        jumpSection(1);
        break;
      case "rotate_left":
        jumpSection(-1);
        break;
      default:
        break;
    }
  };

  const loop = () => {
    if (state !== "running" || !landmarker) return;
    raf = requestAnimationFrame(loop);
    if (video.readyState < 2 || video.currentTime === lastVideoTime) return;
    lastVideoTime = video.currentTime;
    try {
      const now = performance.now();
      const result = landmarker.detectForVideo(video, now);
      const outcome = stabilizer.process(result.landmarks?.[0] ?? null, now);
      if (outcome.skipped) return;
      handle(outcome);
      frames += 1;
      if (now - fpsWindowStart >= 1000) {
        fpsLabel.textContent = `${frames} FPS`;
        frames = 0;
        fpsWindowStart = now;
      }
    } catch (error) {
      console.error("Gesture detection failed", error);
    }
  };

  const describe = (error: unknown): string => {
    const name = error instanceof DOMException ? error.name : "";
    if (name === "NotAllowedError") return "Camera permission was denied, so Gesture Mode can't start.";
    if (name === "NotFoundError") return "No camera was found on this device.";
    if (name === "NotReadableError") return "The camera is already in use by another app.";
    return "Gesture Mode couldn't start on this device.";
  };

  const stop = (keepSession = false) => {
    state = "idle";
    cancelAnimationFrame(raf);
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
    video.srcObject = null;
    lastVideoTime = -1;
    stabilizer.reset();
    hud.hidden = true;
    hideCursor();
    setToggles(false);
    if (!keepSession) sessionStorage.removeItem(SESSION_KEY);
  };

  const start = async () => {
    if (state !== "idle") return;
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      toast("Gesture Mode needs a secure connection and a browser with camera access.");
      return;
    }

    state = "starting";
    hud.hidden = false;
    setToggles(true);
    status.textContent = "Starting camera…";
    fpsLabel.textContent = "";

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user", frameRate: { ideal: 30, max: 30 } },
        audio: false,
      });
      if (state !== "starting") {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      video.srcObject = stream;
      await video.play();

      status.textContent = "Loading hand model…";
      landmarker = await loadLandmarker();
      if (state !== "starting") return;

      stabilizer = createGestureStabilizer();
      state = "running";
      sessionStorage.setItem(SESSION_KEY, "on");
      status.textContent = "Show an open palm to move";
      raf = requestAnimationFrame(loop);
    } catch (error) {
      const expected = error instanceof DOMException && ["NotAllowedError", "NotFoundError", "NotReadableError"].includes(error.name);
      if (!expected) console.error("Gesture Mode failed to start", error);
      stop();
      toast(describe(error));
    }
  };

  toggles.forEach((toggle) =>
    toggle.addEventListener("click", () => {
      if (state === "idle") intro.showModal();
      else stop();
    }),
  );

  intro.querySelector("[data-gesture-start]")?.addEventListener("click", () => {
    intro.close();
    void start();
  });
  intro.querySelectorAll("[data-gesture-cancel]").forEach((button) => button.addEventListener("click", () => intro.close()));
  intro.addEventListener("click", (event) => {
    if (event.target === intro) intro.close();
  });
  hud.querySelector("[data-gesture-stop]")?.addEventListener("click", () => stop());

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !event.defaultPrevented && state !== "idle" && !document.querySelector("dialog[open]")) stop();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state !== "idle") stop(true);
    else if (!document.hidden && state === "idle" && sessionStorage.getItem(SESSION_KEY) === "on") void start();
  });
  window.addEventListener("pagehide", () => {
    if (state !== "idle") stop(true);
  });

  if (sessionStorage.getItem(SESSION_KEY) === "on") void start();
}
