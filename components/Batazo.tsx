"use client";

import { useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { revealSection } from "@/lib/reveal";
import { burst, starCannon } from "@/lib/fx";
import { worries } from "@/lib/content";

export default function Batazo() {
  const root = useRef<HTMLElement>(null);
  const arena = useRef<HTMLDivElement>(null);
  const bat = useRef<SVGSVGElement>(null);
  const [smashed, setSmashed] = useState<number[]>([]);
  const done = smashed.length === worries.length;

  const { contextSafe } = useGSAP({ scope: root });

  const float = contextSafe(() => {
    gsap.utils.toArray<HTMLElement>(".batazo-worry", root.current).forEach((el, i) => {
      gsap.to(el, {
        y: gsap.utils.random(-14, 14),
        x: gsap.utils.random(-10, 10),
        duration: gsap.utils.random(2.2, 3.6),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: i * 0.12,
      });
    });
  });

  useGSAP(
    () => {
      revealSection(root.current);
      float();
      gsap.from(".batazo-worry", {
        scale: 0,
        autoAlpha: 0,
        stagger: 0.08,
        duration: 0.7,
        ease: "back.out(1.8)",
        scrollTrigger: { trigger: ".arena", start: "top 80%", once: true },
      });
    },
    { scope: root }
  );

  useGSAP(
    () => {
      if (!done || !arena.current) return;
      gsap.fromTo(".batazo-done", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.8, delay: 0.6, ease: "power3.out" });
      burst(arena.current, arena.current.clientWidth / 2, arena.current.clientHeight / 2, {
        count: 40,
        shape: "star",
        distance: 260,
        delay: 0.4,
      });
      starCannon(0.5, 0.5);
    },
    { dependencies: [done], scope: root }
  );

  const hit = contextSafe((i: number, e: MouseEvent<HTMLButtonElement>) => {
    if (smashed.includes(i) || !arena.current) return;
    const el = e.currentTarget;
    const a = arena.current.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    const cx = b.left - a.left + b.width / 2;
    const cy = b.top - a.top + b.height / 2;

    gsap.killTweensOf(el);

    // El bate aparece abajo a la derecha de la burbuja y la golpea.
    if (bat.current) {
      gsap.set(bat.current, { x: cx + 52, y: cy - 90, transformOrigin: "50% 100%", rotation: 45, autoAlpha: 1 });
      gsap.to(bat.current, { rotation: -42, duration: 0.2, ease: "power4.in" });
      gsap.to(bat.current, { autoAlpha: 0, duration: 0.25, delay: 0.28 });
    }

    // Hit-stop y temblor: el golpe se siente en toda la arena.
    gsap.fromTo(arena.current, { x: 0, y: 0 }, { x: "random(-9,9)", y: "random(-7,7)", duration: 0.04, repeat: 7, repeatRefresh: true, delay: 0.17, ease: "none", onComplete: () => { gsap.set(arena.current, { x: 0, y: 0 }); } });
    gsap.fromTo(".batazo-flash", { autoAlpha: 0.55 }, { autoAlpha: 0, duration: 0.5, delay: 0.17, ease: "power2.out" });

    gsap
      .timeline()
      .to(el, { scale: 1.3, rotation: gsap.utils.random(-12, 12), duration: 0.1, delay: 0.17, ease: "power2.out" })
      .add(() => {
        burst(arena.current as HTMLElement, cx, cy, {
          count: 20,
          distance: 130,
          colors: ["#FF4FA3", "#FF7CC4", "#5B7CFF", "#FFFFFF", "#E5174F"],
        });
        setSmashed((s) => [...s, i]);
      })
      .to(el, { scale: 1, rotation: 0, duration: 0.8, ease: "elastic.out(1,.45)" })
      .add(() => {
        gsap.to(el, { y: "-=16", duration: 2.6, repeat: -1, yoyo: true, ease: "sine.inOut" });
      });
  });

  const reset = contextSafe(() => {
    const items = gsap.utils.toArray<HTMLElement>(".batazo-worry", root.current);
    gsap.killTweensOf(items);
    gsap.set(items, { clearProps: "transform,opacity,visibility" });
    setSmashed([]);
    float();
  });

  return (
    <section className="section batazo" id="batazo" data-ghost="LIBÉRATE" ref={root}>
      <h2 className="section-title">Batazo a lo que pesa</h2>
      <p className="lede">
        Toma el bate. Cada burbuja es algo que hoy no tiene lugar aquí. Dale con ganas y mira en qué se convierte.
      </p>
      <p className="batazo-count" aria-live="polite">
        {smashed.length} de {worries.length}
      </p>

      <div className="arena" ref={arena}>
        <div className="batazo-flash" aria-hidden="true" />
        {worries.map((w, i) => {
          const isDone = smashed.includes(i);
          return (
            <button
              type="button"
              key={w.worry}
              data-nofx
              className={`batazo-worry${isDone ? " is-smashed" : ""}`}
              style={{ "--x": `${w.x}%`, "--y": `${w.y}%` } as CSSProperties}
              onClick={(e) => hit(i, e)}
              aria-label={isDone ? w.antidote : `Golpear: ${w.worry}`}
            >
              {isDone ? w.antidote : w.worry}
            </button>
          );
        })}

        <svg ref={bat} className="swing-bat" viewBox="-16 -112 32 180" aria-hidden="true">
          <path
            d="M-9 -100Q0 -108 9 -100L10 -50Q9 -20 4 0L3 52Q4 60 0 62Q-4 60 -3 52L-4 0Q-9 -20 -10 -50Z"
            fill="#F2B35E"
            stroke="#5E3416"
            strokeWidth="2"
          />
        </svg>
      </div>

      {done && (
        <div className="batazo-done">
          <p>Lo que pesaba ya no está. Quedaron frases que sí te pertenecen.</p>
          <button type="button" className="btn btn-quiet" onClick={reset}>
            Otra ronda
          </button>
        </div>
      )}
    </section>
  );
}
