"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { burst } from "@/lib/fx";

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(2026);
const STARS = Array.from({ length: 90 }, () => ({
  x: (rand() * 100).toFixed(2),
  y: (rand() * 100).toFixed(2),
  s: (1 + rand() * 2.2).toFixed(2),
  d: (rand() * 6).toFixed(2),
  t: (3 + rand() * 4).toFixed(2),
}));

/*
  Los cuatro actos del recorrido y cómo se siente cada uno.
  0 inicio · 1 dolor · 2 reflexión · 3 resurrección · 4 futuro
  dir: >0 cae (ceniza, lluvia) · <0 sube (brasas, chispas). Se mezcla de forma suave entre actos.
*/
export const ACTS = [
  { name: "Inicio", a: "rgb(10,8,34)", b: "rgb(28,22,92)", au: ["rgb(255,79,163)", "rgb(91,124,255)", "rgb(216,59,210)"], dir: -0.25, speed: 0.3, alpha: 0.55, stars: 1, colors: ["#ff7cc4", "#5b7cff", "#ffffff"] },
  { name: "Dolor", a: "rgb(12,6,30)", b: "rgb(84,10,66)", au: ["rgb(229,23,79)", "rgb(76,40,170)", "rgb(120,20,110)"], dir: 1, speed: 0.55, alpha: 0.5, stars: 0.5, colors: ["#e5174f", "#8b6cff", "#ff4fa3"] },
  { name: "Reflexión", a: "rgb(8,10,52)", b: "rgb(30,50,160)", au: ["rgb(91,124,255)", "rgb(169,155,255)", "rgb(60,70,200)"], dir: -0.12, speed: 0.22, alpha: 0.7, stars: 1, colors: ["#5b7cff", "#a99bff", "#ffffff"] },
  { name: "Resurrección", a: "rgb(46,8,90)", b: "rgb(205,46,155)", au: ["rgb(255,79,163)", "rgb(216,59,210)", "rgb(91,124,255)"], dir: -1, speed: 1.1, alpha: 0.85, stars: 0.5, colors: ["#ff4fa3", "#d83bd2", "#ffffff", "#ffa8dc"] },
  { name: "Futuro", a: "rgb(76,40,150)", b: "rgb(255,124,196)", au: ["rgb(255,168,220)", "rgb(91,124,255)", "rgb(255,255,255)"], dir: -0.7, speed: 0.8, alpha: 0.95, stars: 0.25, colors: ["#ffffff", "#ffa8dc", "#5b7cff", "#ff7cc4"] },
];

type Ember = { x: number; y: number; r: number; v: number; ph: number; c: string };

export default function Atmosphere({ stage }: { stage: number }) {
  const glow = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const act = useRef(0);
  const mix = useRef({ dir: ACTS[0].dir, speed: ACTS[0].speed, alpha: ACTS[0].alpha });
  const palette = useRef<string[]>(ACTS[0].colors);
  const [current, setCurrent] = useState(0);

  const applyAct = (n: number, instant = false) => {
    act.current = n;
    setCurrent(n);
    document.body.dataset.act = String(n);
    const s = ACTS[n];
    const duration = instant || prefersReducedMotion() ? 0 : 2.2;
    gsap.to(".sky", { "--sky-a": s.a, "--sky-b": s.b, duration, ease: "power2.inOut", overwrite: "auto" });
    gsap.to(".stars", { opacity: s.stars, duration, ease: "power2.inOut", overwrite: "auto" });
    gsap.to(".aurora", { "--au-1": s.au[0], "--au-2": s.au[1], "--au-3": s.au[2], duration, ease: "power2.inOut", overwrite: "auto" });
    gsap.to(mix.current, { dir: s.dir, speed: s.speed, alpha: s.alpha, duration: duration || 0.01, ease: "power2.inOut", overwrite: "auto" });
    palette.current = s.colors;
  };

  // Etapa: portada = acto 0; el libro (dolor) arranca en el acto 1. El resto lo manda el scroll.
  useGSAP(
    () => {
      applyAct(stage === 0 ? 0 : act.current || 1, stage === 0);
    },
    { dependencies: [stage] }
  );

  // Cada bloque [data-act] pinta el cielo del acto cuando ocupa el centro de la pantalla.
  useEffect(() => {
    if (stage === 0) return;
    const triggers: ScrollTrigger[] = [];
    const id = requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>("[data-act]").forEach((el) => {
        triggers.push(
          ScrollTrigger.create({
            trigger: el,
            start: "top 60%",
            end: "bottom 60%",
            onToggle: (self) => self.isActive && applyAct(Number(el.dataset.act)),
          })
        );
      });
    });
    return () => {
      cancelAnimationFrame(id);
      triggers.forEach((t) => t.kill());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // Aurora a la deriva, barra de progreso y destello que sigue al cursor.
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    const reduce = prefersReducedMotion();

    const ctx = gsap.context(() => {
      if (!reduce) {
        gsap.utils.toArray<HTMLElement>(".aurora i").forEach((el, i) => {
          gsap.to(el, { x: "random(-18,18)vw", y: "random(-14,14)vh", scale: "random(0.8,1.35)", duration: 11 + i * 3, ease: "sine.inOut", repeat: -1, yoyo: true, repeatRefresh: true });
        });
      }
      gsap.to(".progress-fill", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.25 } });
    });

    const fine = window.matchMedia("(pointer: fine)").matches;
    const el = glow.current;
    let onMove: ((e: PointerEvent) => void) | undefined;

    if (fine && el && !reduce) {
      const xTo = gsap.quickTo(el, "x", { duration: 0.7, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.7, ease: "power3" });
      onMove = (e) => {
        xTo(e.clientX);
        yTo(e.clientY);
      };
      window.addEventListener("pointermove", onMove);
    }

    const onDown = (e: PointerEvent) => {
      if (reduce) return;
      if ((e.target as Element).closest("[data-nofx], input, textarea")) return;
      burst(document.body, e.clientX, e.clientY, { count: 12, shape: "star", distance: 70, colors: palette.current });
    };
    window.addEventListener("pointerdown", onDown);

    return () => {
      ctx.revert();
      if (onMove) window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    };
  }, []);

  // Brasas / ceniza / chispas en canvas: sube, cae o flota según el acto.
  useEffect(() => {
    const cv = canvas.current;
    if (!cv || prefersReducedMotion()) return;
    const g = cv.getContext("2d");
    if (!g) return;

    let w = 0, h = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const count = window.innerWidth < 760 ? 38 : 80;
    const pick = () => palette.current[Math.floor(Math.random() * palette.current.length)];
    const parts: Ember[] = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h, r: 0.8 + Math.random() * 2.6, v: 0.4 + Math.random() * 1.1, ph: Math.random() * 6.28, c: pick(),
    }));

    const draw = (time: number) => {
      const { dir, speed, alpha } = mix.current;
      g.clearRect(0, 0, w, h);
      g.globalCompositeOperation = "lighter";
      for (const p of parts) {
        p.y += dir * speed * p.v * 1.6;
        p.x += Math.sin(time * 0.7 + p.ph) * 0.35;
        if (p.y < -12) { p.y = h + 12; p.x = Math.random() * w; p.c = pick(); }
        if (p.y > h + 12) { p.y = -12; p.x = Math.random() * w; p.c = pick(); }
        g.globalAlpha = alpha * (0.35 + 0.65 * Math.abs(Math.sin(time * 1.2 + p.ph)));
        g.shadowBlur = 14;
        g.shadowColor = p.c;
        g.fillStyle = p.c;
        g.beginPath();
        g.arc(p.x, p.y, p.r, 0, 6.283);
        g.fill();
      }
    };
    gsap.ticker.add(draw);
    return () => {
      gsap.ticker.remove(draw);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div aria-hidden="true">
      <div className="sky" />
      <div className="aurora">
        <i /><i /><i />
      </div>
      <div className="stars">
        {STARS.map((st, i) => (
          <i
            key={i}
            className="star"
            style={{
              left: `${st.x}%`,
              top: `${st.y}%`,
              width: `${st.s}px`,
              height: `${st.s}px`,
              animationDelay: `${st.d}s`,
              animationDuration: `${st.t}s`,
            }}
          />
        ))}
      </div>
      <canvas className="embers" ref={canvas} />
      <div className="grain" />
      <div className="cursor-glow" ref={glow} />
      <div className="progress"><div className="progress-fill" /></div>
      {stage >= 1 && (
        <ol className="rail">
          {ACTS.slice(1).map((a, i) => (
            <li key={a.name} className={current === i + 1 ? "on" : ""}>
              <span>{a.name}</span>
              <i />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
