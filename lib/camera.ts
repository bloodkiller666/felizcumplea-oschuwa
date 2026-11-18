import { gsap, prefersReducedMotion } from "./gsap";

/*
  Cámara en primera persona sobre un mundo CSS 3D. La "cámara" es el mundo moviéndose en sentido contrario:
    scale · rotateZ(roll) · rotateX · rotateY · translate3d(-x, -y, -z)
  z es la distancia hacia atrás: enfocar un aparato en z = su z lo deja a escala 1 (texto nítido).
  Los vuelos hacen un arco (la cámara se aleja un poco y vuelve) con un ligero balanceo, como si caminaras.
*/
export type Pose = { x: number; y: number; z: number; ry: number; rx: number; s: number };

type State = Pose & { lift: number; roll: number; bob: number; px: number; py: number };

export type Camera = {
  jump(p: Pose): void;
  flyTo(p: Pose, o?: { duration?: number; lift?: number; roll?: number; ease?: string }): Promise<void>;
  setParallax(amp: number): void;
  destroy(): void;
};

export function createCamera(world: HTMLElement, stage: HTMLElement, start: Pose): Camera {
  const c: State = { ...start, lift: 0, roll: 0, bob: 0, px: 0, py: 0 };
  let amp = 1;
  let last = "";
  const reduce = prefersReducedMotion();

  const apply = () => {
    const t = `scale(${c.s.toFixed(4)}) rotateZ(${c.roll.toFixed(3)}deg) rotateX(${(c.rx + c.py).toFixed(3)}deg) rotateY(${(-c.ry + c.px).toFixed(3)}deg) translate3d(${(-c.x).toFixed(2)}px, ${(-c.y + c.bob).toFixed(2)}px, ${(-(c.z + c.lift)).toFixed(2)}px)`;
    if (t !== last) {
      last = t;
      world.style.transform = t;
    }
  };
  gsap.ticker.add(apply);
  apply();

  // Respiración: la cabeza sube y baja apenas.
  const breathe = reduce ? null : gsap.to(c, { bob: 5, duration: 3.4, ease: "sine.inOut", yoyo: true, repeat: -1 });

  // Paralaje con el puntero: mirar un poco hacia donde apunta el mouse.
  const toX = gsap.quickTo(c, "px", { duration: 1.1, ease: "power3" });
  const toY = gsap.quickTo(c, "py", { duration: 1.1, ease: "power3" });
  const onMove = (e: PointerEvent) => {
    if (reduce || e.pointerType !== "mouse") return;
    toX((e.clientX / window.innerWidth - 0.5) * 2 * amp);
    toY((0.5 - e.clientY / window.innerHeight) * 2 * amp * 0.6);
  };
  stage.addEventListener("pointermove", onMove);

  let flight: gsap.core.Timeline | null = null;

  return {
    jump(p) {
      flight?.kill();
      Object.assign(c, p, { lift: 0, roll: 0 });
      apply();
    },
    flyTo(p, o = {}) {
      flight?.kill();
      if (reduce) {
        Object.assign(c, p, { lift: 0, roll: 0 });
        apply();
        return Promise.resolve();
      }
      const d = o.duration ?? 2.4;
      const lift = o.lift ?? 420;
      const roll = o.roll ?? 1.1;
      return new Promise<void>((resolve) => {
        flight = gsap
          .timeline({ onComplete: () => resolve() })
          .to(c, { x: p.x, y: p.y, z: p.z, ry: p.ry, rx: p.rx, s: p.s, duration: d, ease: o.ease ?? "power3.inOut" }, 0)
          .to(c, { lift, duration: d * 0.45, ease: "sine.out" }, 0)
          .to(c, { lift: 0, duration: d * 0.55, ease: "sine.inOut" }, d * 0.45)
          .to(c, { roll, duration: d * 0.4, ease: "sine.inOut" }, 0)
          .to(c, { roll: 0, duration: d * 0.6, ease: "sine.inOut" }, d * 0.4);
      });
    },
    setParallax(a) {
      amp = a;
    },
    destroy() {
      stage.removeEventListener("pointermove", onMove);
      gsap.ticker.remove(apply);
      breathe?.kill();
      flight?.kill();
    },
  };
}
