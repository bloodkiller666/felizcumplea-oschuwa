import confetti from "canvas-confetti";
import { gsap } from "./gsap";

// Rosa y azul del cabello, magenta del neón, rojo de los ojos y blanco del vendaje.
export const PALETTE = ["#FF4FA3", "#FF7CC4", "#5B7CFF", "#A99BFF", "#E5174F", "#FFFFFF"];

const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];

type BurstOptions = {
  count?: number;
  colors?: string[];
  distance?: number;
  shape?: "dot" | "star" | "confetti";
  gravity?: number;
  delay?: number;
};

/** Explosión de partículas con física real (Physics2D). Con host = document.body usa coordenadas de pantalla. */
export function burst(host: HTMLElement, x: number, y: number, opts: BurstOptions = {}) {
  const { count = 14, colors = PALETTE, distance = 90, shape = "dot", gravity = 0, delay = 0 } = opts;
  const fixed = host === document.body;

  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = `fx fx-${shape}`;
    el.style.position = fixed ? "fixed" : "absolute";
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.background = pick(colors);
    el.style.boxShadow = `0 0 10px ${el.style.background}`;
    host.appendChild(el);

    gsap.set(el, { scale: gsap.utils.random(0.7, 1.4) });
    gsap.to(el, {
      physics2D: {
        velocity: gsap.utils.random(distance * 1.2, distance * 3.2),
        angle: gsap.utils.random(0, 360),
        gravity: 260 + gravity,
        friction: 0.04,
      },
      rotation: gsap.utils.random(-360, 360),
      scale: 0,
      opacity: 0,
      delay,
      duration: gsap.utils.random(0.8, 1.5),
      ease: "power2.in",
      onComplete: () => el.remove(),
    });
  }
}

const FULL = { zIndex: 120, disableForReducedMotion: true };

/** Lluvia de confeti a pantalla completa (canvas-confetti: miles de piezas sin coste de DOM). */
export function confettiRain(count = 140) {
  const end = Date.now() + 2600;
  const frame = () => {
    confetti({ ...FULL, particleCount: 6, angle: 60, spread: 70, origin: { x: 0, y: 0.75 }, colors: PALETTE, startVelocity: 62 });
    confetti({ ...FULL, particleCount: 6, angle: 120, spread: 70, origin: { x: 1, y: 0.75 }, colors: PALETTE, startVelocity: 62 });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
  confetti({ ...FULL, particleCount: count, spread: 120, origin: { y: -0.1 }, gravity: 0.7, ticks: 320, colors: PALETTE, shapes: ["square", "circle"], scalar: 1.1 });
}

/** Cañón de estrellas y corazones para momentos de victoria. */
export function starCannon(x = 0.5, y = 0.6) {
  const star = confetti.shapeFromPath({ path: "M50 0 L63 36 L100 38 L70 60 L80 100 L50 76 L20 100 L30 60 L0 38 L37 36 Z" });
  confetti({ ...FULL, particleCount: 60, spread: 360, startVelocity: 38, origin: { x, y }, shapes: [star], colors: PALETTE, scalar: 1.6, ticks: 220 });
}

/** Fuegos artificiales de resurrección: suben y estallan en rosa y azul. */
export function fireworks(duration = 3200) {
  const end = Date.now() + duration;
  const id = setInterval(() => {
    if (Date.now() > end) return clearInterval(id);
    confetti({ ...FULL, particleCount: 40, startVelocity: 30, spread: 360, ticks: 70, origin: { x: Math.random() * 0.8 + 0.1, y: Math.random() * 0.4 + 0.1 }, colors: PALETTE });
  }, 260);
}
