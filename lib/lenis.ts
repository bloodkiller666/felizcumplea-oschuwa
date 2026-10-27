import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "./gsap";

let lenis: Lenis | null = null;

/** Scroll suave sincronizado con ScrollTrigger (un único ticker: el de GSAP). */
export function startLenis() {
  if (lenis || typeof window === "undefined" || prefersReducedMotion()) return;
  lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 3), wheelMultiplier: 0.95 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
}

const tick = (time: number) => lenis?.raf(time * 1000);

export function stopLenis() {
  if (!lenis) return;
  gsap.ticker.remove(tick);
  lenis.destroy();
  lenis = null;
}

/** Pausa/reanuda el scroll (modales). */
export const lockScroll = (locked: boolean) => (locked ? lenis?.stop() : lenis?.start());

/** Salto inmediato (cambios de etapa) o desplazamiento suave. */
export function scrollToY(y: number, immediate = true) {
  if (lenis) lenis.scrollTo(y, { immediate, duration: 1.5, easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) });
  else window.scrollTo(0, y);
}
