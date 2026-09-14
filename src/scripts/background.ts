export {};

type PointerDetail = { x: number; y: number; active: boolean };
type Vec3 = [number, number, number];
type Palette = { base: Vec3; c1: Vec3; c2: Vec3; c3: Vec3; glow: Vec3; dark: number };

const VERTEX_SHADER = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `
precision mediump float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform float uPointerStrength;
uniform float uScroll;
uniform vec3 uBase;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform vec3 uGlow;
uniform float uDark;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  mat2 rotate = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p = rotate * p;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float scale = min(uResolution.x, uResolution.y);
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / scale;
  float t = uTime * 0.04;
  p.y += uScroll * 0.16;

  vec2 q = vec2(fbm(p * 1.1 + vec2(0.0, t)), fbm(p * 1.1 + vec2(5.2, 1.3) - t));
  vec2 r = vec2(
    fbm(p * 1.4 + 2.8 * q + vec2(1.7, 9.2) + t * 1.3),
    fbm(p * 1.4 + 2.8 * q + vec2(8.3, 2.8) - t * 1.1)
  );
  float f = fbm(p * 1.3 + 2.4 * r);

  float strength = mix(0.72, 1.0, uDark);
  vec3 color = uBase;
  color = mix(color, uC1, smoothstep(0.25, 0.95, f) * 0.85 * strength);
  color = mix(color, uC2, smoothstep(0.35, 1.05, length(q)) * 0.6 * strength);
  color = mix(color, uC3, smoothstep(0.5, 1.0, r.x) * 0.5 * strength);

  float folds = smoothstep(0.58, 0.92, f);
  color = mix(color, uGlow, folds * folds * folds * mix(0.14, 0.22, uDark));

  vec2 pointer = (uPointer - 0.5 * uResolution) / scale;
  float distanceToPointer = length(p - pointer);
  color += uGlow * uPointerStrength * exp(-distanceToPointer * distanceToPointer * 7.0) * mix(0.09, 0.15, uDark);

  float vignette = smoothstep(1.1, 0.2, length((uv - 0.5) * vec2(1.15, 1.0)));
  color *= mix(mix(0.96, 0.58, uDark), 1.0, vignette);

  color += (hash(gl_FragCoord.xy) - 0.5) * mix(0.022, 0.035, uDark);
  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}`;

const canvas = document.querySelector<HTMLCanvasElement>("[data-bg]");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

const announceReady = () => window.dispatchEvent(new Event("bg:ready"));

function toVec3(value: string, fallback: Vec3): Vec3 {
  const hex = value.trim().replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(hex)) return fallback;
  return [parseInt(hex.slice(0, 2), 16) / 255, parseInt(hex.slice(2, 4), 16) / 255, parseInt(hex.slice(4, 6), 16) / 255];
}

function readPalette(): Palette {
  const styles = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: Vec3) => toVec3(styles.getPropertyValue(name), fallback);
  return {
    base: read("--bg-base", [0.02, 0.02, 0.035]),
    c1: read("--bg-c1", [0.05, 0.1, 0.17]),
    c2: read("--bg-c2", [0.1, 0.07, 0.19]),
    c3: read("--bg-c3", [0.17, 0.11, 0.04]),
    glow: read("--bg-glow", [0.95, 0.71, 0.27]),
    dark: document.documentElement.dataset.theme === "dark" ? 1 : 0,
  };
}

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Could not create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(log ?? "Shader failed to compile");
  }
  return shader;
}

function fallback() {
  document.documentElement.classList.add("no-webgl");
  announceReady();
}

if (!canvas) announceReady();
else start(canvas);

function start(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "high-performance",
  });
  if (!gl) {
    fallback();
    return;
  }

  let program: WebGLProgram;
  try {
    program = gl.createProgram()!;
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "Program failed to link");
  } catch (error) {
    console.error("Background shader unavailable", error);
    fallback();
    return;
  }

  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uniform = (name: string) => gl.getUniformLocation(program, name);
  const u = {
    resolution: uniform("uResolution"),
    time: uniform("uTime"),
    pointer: uniform("uPointer"),
    pointerStrength: uniform("uPointerStrength"),
    scroll: uniform("uScroll"),
    base: uniform("uBase"),
    c1: uniform("uC1"),
    c2: uniform("uC2"),
    c3: uniform("uC3"),
    glow: uniform("uGlow"),
    dark: uniform("uDark"),
  };

  const target = readPalette();
  const current: Palette = { base: [...target.base], c1: [...target.c1], c2: [...target.c2], c3: [...target.c3], glow: [...target.glow], dark: target.dark };
  const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, targetX: window.innerWidth / 2, targetY: window.innerHeight / 2, strength: 0, active: false };

  let renderScale = 0.5;
  let raf = 0;
  let announced = false;
  let paletteSettled = true;
  const startedAt = performance.now();

  const resize = () => {
    renderScale = window.innerWidth < 768 ? 0.42 : 0.5;
    canvas.width = Math.max(1, Math.round(window.innerWidth * renderScale));
    canvas.height = Math.max(1, Math.round(window.innerHeight * renderScale));
    gl.viewport(0, 0, canvas.width, canvas.height);
  };

  const easeVec = (from: Vec3, to: Vec3, amount: number) => {
    let moving = false;
    for (let i = 0; i < 3; i++) {
      const delta = to[i]! - from[i]!;
      if (Math.abs(delta) > 0.001) moving = true;
      from[i] = from[i]! + delta * amount;
    }
    return moving;
  };

  const draw = (now: number) => {
    const moving = [
      easeVec(current.base, target.base, 0.07),
      easeVec(current.c1, target.c1, 0.07),
      easeVec(current.c2, target.c2, 0.07),
      easeVec(current.c3, target.c3, 0.07),
      easeVec(current.glow, target.glow, 0.07),
    ].some(Boolean);
    current.dark += (target.dark - current.dark) * 0.07;
    paletteSettled = !moving && Math.abs(target.dark - current.dark) < 0.002;

    pointer.x += (pointer.targetX - pointer.x) * 0.08;
    pointer.y += (pointer.targetY - pointer.y) * 0.08;
    pointer.strength += ((pointer.active ? 1 : 0) - pointer.strength) * 0.05;

    gl.uniform2f(u.resolution, canvas.width, canvas.height);
    gl.uniform1f(u.time, reducedMotion.matches ? 12 : (now - startedAt) / 1000);
    gl.uniform2f(u.pointer, pointer.x * renderScale, (window.innerHeight - pointer.y) * renderScale);
    gl.uniform1f(u.pointerStrength, pointer.strength);
    gl.uniform1f(u.scroll, window.scrollY / Math.max(1, window.innerHeight));
    gl.uniform3fv(u.base, current.base);
    gl.uniform3fv(u.c1, current.c1);
    gl.uniform3fv(u.c2, current.c2);
    gl.uniform3fv(u.c3, current.c3);
    gl.uniform3fv(u.glow, current.glow);
    gl.uniform1f(u.dark, current.dark);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (!announced) {
      announced = true;
      canvas.classList.add("is-ready");
      announceReady();
    }
  };

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    draw(now);
  };

  const renderStill = () => {
    const settle = (now: number) => {
      draw(now);
      if (!paletteSettled) requestAnimationFrame(settle);
    };
    requestAnimationFrame(settle);
  };

  const run = () => {
    cancelAnimationFrame(raf);
    if (document.hidden) return;
    if (reducedMotion.matches) renderStill();
    else raf = requestAnimationFrame(loop);
  };

  const setPointer = (x: number, y: number, active: boolean) => {
    pointer.targetX = x;
    pointer.targetY = y;
    pointer.active = active;
  };

  resize();
  run();

  let resizeFrame = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      resize();
      if (reducedMotion.matches) renderStill();
    });
  });
  window.addEventListener("themechange", () => {
    Object.assign(target, readPalette());
    if (reducedMotion.matches) renderStill();
  });
  window.addEventListener("pointermove", (event) => setPointer(event.clientX, event.clientY, true), { passive: true });
  document.documentElement.addEventListener("pointerleave", () => {
    pointer.active = false;
  });
  window.addEventListener("signal:pointer", (event) => {
    const detail = (event as CustomEvent<PointerDetail>).detail;
    setPointer(detail.x, detail.y, detail.active);
  });
  document.addEventListener("visibilitychange", run);
  reducedMotion.addEventListener("change", run);
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    cancelAnimationFrame(raf);
  });
  canvas.addEventListener("webglcontextrestored", () => window.location.reload());
}
