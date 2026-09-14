export type Landmark = { x: number; y: number; z?: number };

export type Gesture =
  | "click"
  | "thumbs_up"
  | "thumbs_down"
  | "pinch"
  | "zoom"
  | "index_point"
  | "cursor_move"
  | "rotate_left"
  | "rotate_right"
  | "unknown";

export type GestureOutcome = {
  gesture: Gesture | null;
  cursor: { x: number | null; y: number | null } | null;
  skipped?: boolean;
};

const WRIST = 0;
const THUMB_MCP = 2;
const THUMB_TIP = 4;
const INDEX_PIP = 6;
const INDEX_TIP = 8;
const MIDDLE_PIP = 10;
const MIDDLE_TIP = 12;
const RING_PIP = 14;
const RING_TIP = 16;
const PINKY_PIP = 18;
const PINKY_TIP = 20;

const STABLE_THRESHOLD = 5;
const CLICK_COOLDOWN_S = 1;
const MIN_FRAME_INTERVAL_S = 0.05;

const distance = (a: Landmark, b: Landmark) => Math.hypot(a.x - b.x, a.y - b.y);
const fingerOpen = (points: Landmark[], tip: number, pip: number) => points[tip]!.y < points[pip]!.y;

export function classifyGesture(points: Landmark[]): Gesture {
  const wrist = points[WRIST]!;
  const thumbTip = points[THUMB_TIP]!;
  const thumbMcp = points[THUMB_MCP]!;
  const indexTip = points[INDEX_TIP]!;

  const fingers = [
    fingerOpen(points, INDEX_TIP, INDEX_PIP),
    fingerOpen(points, MIDDLE_TIP, MIDDLE_PIP),
    fingerOpen(points, RING_TIP, RING_PIP),
    fingerOpen(points, PINKY_TIP, PINKY_PIP),
  ];

  const thumbToWrist = distance(thumbTip, wrist);
  const thumbExtended = distance(thumbTip, thumbMcp) > 0.07 && thumbToWrist > 0.12;
  const fingersClosed = !fingers.some(Boolean);
  const othersClosed = !fingers.slice(1).some(Boolean);
  const thumbIndex = distance(thumbTip, indexTip);

  if (thumbIndex < 0.05 && fingers[1] && fingers[2] && fingers[3]) return "click";
  if (thumbExtended && fingersClosed && thumbTip.y < wrist.y - 0.08) return "thumbs_up";
  if (thumbExtended && fingersClosed && thumbTip.y > wrist.y + 0.08) return "thumbs_down";
  if (thumbIndex < 0.04 && othersClosed) return "pinch";
  if (thumbExtended && fingers[0] && othersClosed && thumbIndex > 0.13) return "zoom";
  if (fingers[0] && othersClosed && !thumbExtended && thumbToWrist < 0.1) return "index_point";
  if (fingers.every(Boolean) && thumbToWrist >= 0.08) return "cursor_move";

  const twoFingers = fingers[0] && fingers[1] && !fingers[2] && !fingers[3];
  if (twoFingers) {
    if (indexTip.x < wrist.x) return "rotate_left";
    if (indexTip.x > wrist.x) return "rotate_right";
  }
  return "unknown";
}

export function createGestureStabilizer() {
  let lastGesture: Gesture | null = null;
  let count = 0;
  let lastClickAt = 0;
  let lastProcessedAt = 0;

  function process(raw: Landmark[] | null, nowMs: number): GestureOutcome {
    const now = nowMs / 1000;
    if (now - lastProcessedAt < MIN_FRAME_INTERVAL_S) return { gesture: null, cursor: null, skipped: true };
    lastProcessedAt = now;

    if (!raw || raw.length === 0) {
      lastGesture = null;
      count = 0;
      return { gesture: null, cursor: { x: null, y: null } };
    }

    const points = raw.map((p) => ({ x: 1 - p.x, y: p.y, z: p.z }));
    const gesture = classifyGesture(points);

    if (gesture === lastGesture) {
      count += 1;
    } else {
      count = 1;
      lastGesture = gesture;
    }

    const outcome: GestureOutcome = { gesture: null, cursor: null };
    if (count >= STABLE_THRESHOLD && gesture !== "unknown") {
      if (gesture !== "click") {
        outcome.gesture = gesture;
      } else if (now - lastClickAt >= CLICK_COOLDOWN_S) {
        outcome.gesture = gesture;
        lastClickAt = now;
      }
    }

    if (gesture === "cursor_move") {
      const middle = points[MIDDLE_TIP]!;
      outcome.cursor = { x: middle.x, y: middle.y };
    }
    return outcome;
  }

  function reset() {
    lastGesture = null;
    count = 0;
    lastProcessedAt = 0;
  }

  return { process, reset };
}
