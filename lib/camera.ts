import { gsap, prefersReducedMotion } from "./gsap";

/*
  Cámara en primera persona sobre un mundo CSS 3D. La "cámara" es el mundo moviéndose en sentido contrario:
    scale · rotateZ(roll) · rotateX · rotateY · translate3d(-x, -y, -z)
  z es la distancia hacia atrás: enfocar un aparato en z = su z lo deja a escala 1 (texto nítido).
  Los vuelos hacen un arco (la cámara se aleja un poco y vuelve) con un ligero balanceo, como si caminaras.
*/
/** Distancia del ojo al plano de la pantalla (la `perspective` del escenario en room.css). */
const EYE = 1200;

export type Pose = { x: number; y: number; z: number; ry: number; rx: number; s: number };

type State = Pose & { lift: number; roll: number; bob: number; px: number; py: number; yw: number; pt: number; st: number };

/*
  Dos estilos de vuelo:
  · "walk": como en Doom, en línea recta hacia el frente, con el balanceo de los pasos.
  · "turn": como al girar en Five Nights at Freddy's 4: la cámara retrocede en línea recta, se queda quieta y gira
    despacio sobre su eje (con la pantalla oscureciéndose y la cabeza ladeándose) hasta mirar el destino, y camina recto hacia él.
*/
export type FlyOpts = {
  duration?: number;
  ease?: string;
  style?: "walk" | "turn";
  /** Pose a la que retrocede antes de girar (solo "turn"); conserva la x actual. */
  hub?: Pose;
  onTurn?: (turning: boolean) => void;
};

export type Camera = {
  jump(p: Pose): void;
  flyTo(p: Pose, o?: FlyOpts): Promise<void>;
  /** Camina en línea recta hasta la pose (sin tocar el giro actual de la cabeza). */
  move(p: Partial<Pose>, d: number, o?: { ease?: string; steps?: boolean }): Promise<void>;
  /** Gira la cabeza sobre su eje hasta `deg` (absoluto, 0 = de frente al fondo del cuarto). Lento, estilo FNaF 4. */
  pivot(deg: number, d: number, o?: { ease?: string; tilt?: boolean; delay?: number; onTurn?: (turning: boolean) => void }): Promise<void>;
  /** Modo ligero: la cámara deja de "respirar" (así, quieta, no hay que redibujar nada). */
  setLite(on: boolean): void;
  /** Posición actual de la cámara. */
  pos(): Pose;
  setParallax(amp: number): void;
  destroy(): void;
};

export function createCamera(world: HTMLElement, stage: HTMLElement, start: Pose): Camera {
  const c: State = { ...start, lift: 0, roll: 0, bob: 0, px: 0, py: 0, yw: 0, pt: 0, st: 0 };
  let amp = 1;
  let last = "";
  const reduce = prefersReducedMotion();

  const apply = () => {
    const t = `scale(${c.s.toFixed(4)}) rotateZ(${c.roll.toFixed(3)}deg) rotateX(${(c.rx + c.py + c.pt).toFixed(3)}deg) rotateY(${(-c.ry + c.px).toFixed(3)}deg) translateZ(${EYE}px) rotateY(${c.yw.toFixed(3)}deg) translateZ(${-EYE}px) translate3d(${(-c.x).toFixed(2)}px, ${(-c.y + c.bob + c.st).toFixed(2)}px, ${(-(c.z + c.lift)).toFixed(2)}px)`;
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
  const extra: gsap.core.Timeline[] = [];

  return {
    jump(p) {
      flight?.kill();
      Object.assign(c, p, { lift: 0, roll: 0, yw: 0, pt: 0, st: 0 });
      apply();
    },
    flyTo(p, o = {}) {
      flight?.kill();
      if (reduce) {
        Object.assign(c, p, { lift: 0, roll: 0, yw: 0, pt: 0 });
        apply();
        return Promise.resolve();
      }
      const d = o.duration ?? 3;
      const ease = o.ease ?? "power1.inOut";
      const rest = { yw: 0, pt: 0, st: 0, roll: 0 };
      const to = (v: Partial<Pose>, dur: number) => ({ ...v, duration: dur, ease });
      const stepper = (tl: gsap.core.Timeline, at: number, dur: number) => {
        // Pasos al caminar (como en Doom): la cabeza sube y baja y se ladea apenas, al ritmo de unos 1.8 pasos por segundo.
        const k = { v: 0 };
        const n = Math.max(2, Math.round(dur * 1.8));
        tl.to(
          k,
          {
            v: 1, duration: dur, ease: "none",
            onUpdate: () => {
              const ph = Math.sin(k.v * n * Math.PI);
              const fade = Math.sin(k.v * Math.PI);
              c.st = -Math.abs(ph) * 9 * fade;
              c.roll = ph * 0.35 * fade;
            },
          },
          at
        );
      };

      return new Promise<void>((resolve) => {
        const tl = gsap.timeline({
          onComplete: () => {
            Object.assign(c, rest);
            o.onTurn?.(false);
            resolve();
          },
        });
        flight = tl;

        if (o.style !== "turn" || !o.hub) {
          // Línea recta, sin girar.
          tl.to(c, to({ x: p.x, y: p.y, z: p.z, ry: p.ry, rx: p.rx, s: p.s }, d), 0);
          stepper(tl, 0, d);
          return;
        }

        const hub = { ...o.hub, x: c.x };
        const dx = p.x - hub.x;
        const dz = Math.max(300, hub.z - p.z);
        const turn = Math.max(-40, Math.min(40, (Math.atan2(dx, dz) * 180) / Math.PI));
        const t1 = d * 0.24; // retrocede en línea recta
        const t2 = d * 0.4; // giro lento sobre el eje
        const t3 = d * 0.36; // camina recto hacia el destino

        // 1) Retrocede del aparato hasta el centro del cuarto.
        tl.to(c, to({ x: hub.x, y: hub.y, z: hub.z, ry: hub.ry, rx: hub.rx, s: hub.s }, t1), 0);
        stepper(tl, 0, t1);

        // 2) Se queda quieta y gira despacio (arranca perezoso, se acelera, frena de golpe), la cabeza ladeada y bajando un poco.
        tl.call(() => o.onTurn?.(true), undefined, t1);
        tl.to(c, { yw: turn, duration: t2, ease: "sine.inOut" }, t1);
        tl.to(c, { roll: Math.sign(turn) * -2.2, pt: -2.5, duration: t2 * 0.5, ease: "sine.inOut" }, t1);
        tl.to(c, { roll: 0, pt: 0, duration: t2 * 0.5, ease: "sine.inOut" }, t1 + t2 * 0.5);
        tl.call(() => o.onTurn?.(false), undefined, t1 + t2 + d * 0.02);

        // 3) Con la mirada en el destino, camina recto hacia él y al llegar se endereza de frente.
        const w = t1 + t2 + d * 0.02;
        tl.to(c, to({ x: p.x, y: p.y, z: p.z, ry: p.ry, rx: p.rx, s: p.s }, t3), w);
        tl.to(c, { yw: 0, duration: t3 * 0.45, ease: "power2.inOut" }, w + t3 * 0.55);
        stepper(tl, w, t3);
      });
    },
    move(p, d, o = {}) {
      return new Promise<void>((resolve) => {
        if (reduce) {
          Object.assign(c, p);
          return resolve();
        }
        const tl = gsap.timeline({ onComplete: () => { c.st = 0; c.roll = 0; resolve(); } });
        tl.to(c, { ...p, duration: d, ease: o.ease ?? "power1.inOut" }, 0);
        if (o.steps !== false) {
          const k = { v: 0 };
          const n = Math.max(2, Math.round(d * 1.8));
          tl.to(k, { v: 1, duration: d, ease: "none", onUpdate: () => {
            const ph = Math.sin(k.v * n * Math.PI);
            const fade = Math.sin(k.v * Math.PI);
            c.st = -Math.abs(ph) * 9 * fade;
            c.roll = ph * 0.35 * fade;
          } }, 0);
        }
        extra.push(tl);
      });
    },
    pivot(deg, d, o = {}) {
      return new Promise<void>((resolve) => {
        if (reduce) {
          c.yw = deg;
          return resolve();
        }
        const tl = gsap.timeline({ delay: o.delay ?? 0, onComplete: () => { c.roll = 0; c.pt = 0; o.onTurn?.(false); resolve(); } });
        tl.call(() => o.onTurn?.(true), undefined, 0);
        tl.to(c, { yw: deg, duration: d, ease: o.ease ?? "sine.inOut" }, 0);
        if (o.tilt !== false) {
          const sg = Math.sign(deg - c.yw) || 1;
          tl.to(c, { roll: sg * -2.2, pt: -2.5, duration: d * 0.5, ease: "sine.inOut" }, 0);
          tl.to(c, { roll: 0, pt: 0, duration: d * 0.5, ease: "sine.inOut" }, d * 0.5);
        }
        extra.push(tl);
      });
    },
    setLite(on) {
      if (!breathe) return;
      if (on) {
        breathe.pause();
        c.bob = 0;
      } else breathe.resume();
    },
    pos() {
      return { x: c.x, y: c.y, z: c.z, ry: c.ry, rx: c.rx, s: c.s };
    },
    setParallax(a) {
      amp = a;
    },
    destroy() {
      stage.removeEventListener("pointermove", onMove);
      gsap.ticker.remove(apply);
      breathe?.kill();
      flight?.kill();
      extra.forEach((t) => t.kill());
    },
  };
}
