import { gsap } from "./gsap";

/*
  Rendimiento adaptable para PCs sin tarjeta gráfica (el objetivo es mantenerse entre 30 y 60 fps).
  Tres niveles:
    0 · completo
    1 · ligero  (html.lite):  sin grano, sin parpadeos de neón, sin hue-rotate, sin sombras animadas, la cámara no "respira"
    2 · mínimo  (html.ultra): además sin sombras ni brillos del decorado y la animación se limita a 30 fps
  Se elige al empezar (¿hay gráfica por hardware? ¿cuántos núcleos?) y, si los fps medidos caen de ~40, sube de nivel solo.
  Se puede forzar con ?perf=0, ?perf=1 o ?perf=2.
*/
export type PerfLevel = 0 | 1 | 2;

let level: PerfLevel = 0;
const subs = new Set<(l: PerfLevel) => void>();

export const perfLevel = () => level;
export function subscribePerf(f: (l: PerfLevel) => void) {
  subs.add(f);
  return () => {
    subs.delete(f);
  };
}

function apply(l: PerfLevel) {
  level = l;
  const root = document.documentElement;
  root.classList.toggle("lite", l >= 1);
  root.classList.toggle("ultra", l >= 2);
  gsap.ticker.fps(l >= 2 ? 30 : 0); // 0 = sin tope
  subs.forEach((f) => f(l));
}

/** ¿El navegador dibuja por software (sin GPU)? */
function softwareRenderer(): boolean {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl") || c.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return true;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const name = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return /swiftshader|llvmpipe|software|basic render|microsoft basic/i.test(name);
  } catch {
    return false;
  }
}

export function initPerf(): () => void {
  const forced = new URLSearchParams(window.location.search).get("perf");
  if (forced === "0" || forced === "1" || forced === "2") {
    apply(Number(forced) as PerfLevel);
    return () => {};
  }

  const nav = navigator as Navigator & { deviceMemory?: number };
  let start: PerfLevel = 0;
  if (softwareRenderer()) start = 2;
  else if ((nav.hardwareConcurrency && nav.hardwareConcurrency <= 4) || (nav.deviceMemory && nav.deviceMemory <= 4)) start = 1;
  apply(start);

  // Vigila los fps al principio: si se queda corto, sube de nivel (nunca baja, para no ir y venir).
  let raf = 0;
  let last = 0;
  let skip = 100; // calentamiento: la carga inicial no cuenta
  const dts: number[] = [];
  const t0 = performance.now();
  const tick = (now: number) => {
    if (last && !document.hidden) {
      const dt = now - last;
      if (dt < 250) {
        if (skip > 0) skip--;
        else dts.push(dt);
      }
    }
    last = now;
    if (dts.length >= 90) {
      const sum = dts.reduce((a, b) => a + b, 0);
      const fps = 90 / (sum / 1000);
      dts.length = 0;
      if (fps < 40 && level < 2) {
        apply((level + 1) as PerfLevel);
        skip = 60;
      }
    }
    if (level < 2 && now - t0 < 90000) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
