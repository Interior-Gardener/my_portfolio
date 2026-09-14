import { existsSync } from "node:fs";
import { copyFile, mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const wasmSource = join(root, "node_modules", "@mediapipe", "tasks-vision", "wasm");
const publicDir = join(root, "public", "mediapipe");
const wasmDest = join(publicDir, "wasm");
const modelDest = join(publicDir, "hand_landmarker.task");
const modelUrl =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const minModelBytes = 1_000_000;

async function copyWasm() {
  if (!existsSync(wasmSource)) throw new Error("@mediapipe/tasks-vision is not installed; run npm install first");
  await mkdir(wasmDest, { recursive: true });
  let copied = 0;
  for (const file of await readdir(wasmSource)) {
    const dest = join(wasmDest, file);
    if (existsSync(dest)) continue;
    await copyFile(join(wasmSource, file), dest);
    copied += 1;
  }
  console.log(copied ? `[mediapipe] copied ${copied} runtime file(s)` : "[mediapipe] runtime already present");
}

async function ensureModel() {
  if (existsSync(modelDest) && (await stat(modelDest)).size >= minModelBytes) {
    console.log("[mediapipe] hand model present");
    return;
  }
  await mkdir(publicDir, { recursive: true });
  console.log("[mediapipe] downloading hand model");
  const response = await fetch(modelUrl);
  if (!response.ok) throw new Error(`model download failed with HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < minModelBytes) throw new Error("model download looks truncated");
  await writeFile(modelDest, bytes);
  console.log("[mediapipe] hand model saved");
}

try {
  await copyWasm();
  await ensureModel();
} catch (error) {
  console.error(`[mediapipe] setup incomplete: ${error.message}. Gesture Mode will show an error until this succeeds.`);
}
