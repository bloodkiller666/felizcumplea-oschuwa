"use client";

import { useRef, type MouseEvent } from "react";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { person } from "@/lib/content";
import PantherMark from "./PantherMark";

export default function Hero({ onStart }: { onStart: (x: number, y: number) => void }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      gsap.set(q(".hero-title"), { visibility: "visible" });

      if (prefersReducedMotion()) {
        gsap.set(q("[data-in]"), { autoAlpha: 1 });
        return;
      }

      // Un solo momento orquestado: se enciende el faro, entra el nombre letra a letra y aparece la pantera.
      const split = SplitText.create(q(".hero-title")[0], { type: "chars,words", mask: "chars", charsClass: "char" });
      gsap.set(q("[data-in]"), { autoAlpha: 0 });

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.fromTo(q(".headlight"), { autoAlpha: 0, scale: 0.3 }, { autoAlpha: 1, scale: 1, duration: 1.8 })
        .from(split.chars, { yPercent: 115, rotate: 6, duration: 1, stagger: { each: 0.035, from: "start" } }, 0.35)
        .fromTo(
          q(".panther-wrap"),
          { autoAlpha: 0, xPercent: 10, scale: 0.9 },
          { autoAlpha: 1, xPercent: 0, scale: 1, duration: 1.4 },
          0.6
        )
        .fromTo(q(".hero-sub"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.9 }, 1.2)
        .fromTo(
          q(".hero-cta"),
          { autoAlpha: 0, y: 24, scale: 0.92 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.8)" },
          1.5
        );

      // Vida en la pantera: parpadeo y vaivén del bate.
      const eyes = q(".eye");
      if (eyes.length) {
        gsap
          .timeline({ repeat: -1, repeatDelay: 3.4, delay: 3.2 })
          .to(eyes, { scaleY: 0.06, transformOrigin: "50% 50%", duration: 0.08 })
          .to(eyes, { scaleY: 1, duration: 0.14 });
      }
      const bat = q(".bat")[0];
      if (bat) {
        gsap.to(bat, { rotation: 7, transformOrigin: "50% 90%", duration: 2.6, yoyo: true, repeat: -1, ease: "sine.inOut" });
      }

      // El nombre respira entre el rosa y el azul del cabello: una ola de color recorre las letras.
      const pink = "#ff4fa3", blue = "#5b7cff";
      const nameChars = q(".hero-name .char");
      gsap.set(nameChars, { color: (i: number) => gsap.utils.interpolate(pink, blue, i / Math.max(1, nameChars.length - 1)) });
      gsap.to(nameChars, { color: (i: number) => gsap.utils.interpolate(blue, pink, i / Math.max(1, nameChars.length - 1)), duration: 2.4, stagger: { each: 0.12, repeat: -1, yoyo: true }, ease: "sine.inOut", delay: 1.4 });

      // Orbes de color a la deriva.
      q(".orb").forEach((el, i) => {
        gsap.to(el, { x: "random(-60,60)", y: "random(-50,50)", scale: "random(0.85,1.2)", duration: 6 + i * 1.7, ease: "sine.inOut", repeat: -1, yoyo: true, repeatRefresh: true });
      });

      // Paralaje con el cursor: cada capa se mueve según su profundidad.
      const cleanups: (() => void)[] = [];
      const fine = window.matchMedia("(pointer: fine)").matches;
      if (fine) {
        const layers = q("[data-depth]").map((el) => ({
          x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3" }),
          y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3" }),
          d: Number((el as HTMLElement).dataset.depth),
        }));
        const move = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          layers.forEach((l) => { l.x(nx * l.d); l.y(ny * l.d); });
        };
        window.addEventListener("pointermove", move);

        // Botón magnético.
        const btn = q(".hero-cta")[0] as HTMLElement | undefined;
        const bx = btn && gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3" });
        const by = btn && gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3" });
        const mag = (e: PointerEvent) => {
          if (!btn || !bx || !by) return;
          const r = btn.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          const near = Math.hypot(dx, dy) < 140;
          bx(near ? dx * 0.35 : 0);
          by(near ? dy * 0.35 : 0);
        };
        window.addEventListener("pointermove", mag);
        cleanups.push(() => {
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointermove", mag);
        });
      }

      gsap.to(q(".road-dash"), { backgroundPositionX: "-180px", duration: 2.4, ease: "none", repeat: -1 });
      gsap.to(q(".panther"), {
        yPercent: -10,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });

      return () => cleanups.forEach((f) => f());
    },
    { scope: root }
  );

  const start = (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    onStart(r.left + r.width / 2, r.top + r.height / 2);
  };

  return (
    <section className="hero" ref={root} id="inicio">
      <div className="headlight" data-in data-depth="-40" aria-hidden="true" />
      <div className="orb orb-a" data-depth="60" aria-hidden="true" />
      <div className="orb orb-b" data-depth="-80" aria-hidden="true" />
      <div className="orb orb-c" data-depth="35" aria-hidden="true" />
      <div className="hero-inner">
        <div className="hero-copy">
          <h1 className="hero-title">
            <span className="hero-greet">Feliz cumpleaños,</span>
            <span className="hero-name">{person.name}</span>
          </h1>
          <p className="hero-sub" data-in>
            {person.meaning}. Esta noche la ruta es tuya, y hay mucho por descubrir.
          </p>
          <button type="button" className="btn hero-cta" data-in onClick={start}>
            Empezar el recorrido
          </button>
        </div>
        <div className="panther-wrap" data-in data-depth="30">
          <div className="panther">
            <PantherMark src={person.avatar} label={`Avatar de ${person.name}: una pantera biker con un bate`} />
          </div>
        </div>
      </div>
      <div className="road" aria-hidden="true">
        <div className="road-dash" />
      </div>
    </section>
  );
}
