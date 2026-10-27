"use client";

import { forwardRef, useImperativeHandle, useRef, type CSSProperties } from "react";
import { gsap } from "@/lib/gsap";

export type CoverFn = () => void | Promise<void>;

export type TransitionHandle = {
  /** Portada → libro: zarpazos de pantera + iris que se abre como un faro. */
  claw: (x: number, y: number, cover: CoverFn) => Promise<void>;
  /** Libro → tarot: tiras de papel que caen como páginas. */
  paper: (cover: CoverFn) => Promise<void>;
  /** Cumpleaños → último regalo: nerviosismo, latido y destello. */
  nervous: (cover: CoverFn) => Promise<void>;
  /** Último regalo → despedida: amanecer que sube desde el horizonte. */
  sunrise: (cover: CoverFn) => Promise<void>;
};

const STRIPS = 14;
const wait = (tl: gsap.core.Timeline) => new Promise<void>((res) => tl.eventCallback("onComplete", () => res()));
const radius = () => Math.hypot(window.innerWidth, window.innerHeight);

const Transitions = forwardRef<TransitionHandle>(function Transitions(_, ref) {
  const root = useRef<HTMLDivElement>(null);

  useImperativeHandle(
    ref,
    () => {
      const q = gsap.utils.selector(root);
      const open = () => gsap.set(root.current, { autoAlpha: 1, pointerEvents: "auto" });
      const close = () => {
        gsap.set(root.current, { autoAlpha: 0, pointerEvents: "none" });
        gsap.set(q(".tr-claw-bar, .tr-curtain, .tr-strip, .tr-flash, .tr-sunrise, .tr-vignette"), { clearProps: "all" });
      };

      return {
        // ───────── 1 · Zarpazo ─────────
        async claw(x, y, cover) {
          open();
          const r = radius();
          const tl = gsap.timeline();
          tl.fromTo(q(".tr-claw-bar"), { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 0.3, stagger: 0.1, ease: "power4.out" })
            .fromTo(q(".tr-flash"), { opacity: 0 }, { opacity: 0.5, duration: 0.09, yoyo: true, repeat: 1 }, 0.12)
            .fromTo(
              q(".tr-curtain"),
              { clipPath: `circle(0px at ${x}px ${y}px)` },
              { clipPath: `circle(${r}px at ${x}px ${y}px)`, duration: 0.95, ease: "power3.in" },
              0.35
            );
          await wait(tl);
          await cover();

          gsap.set(q(".tr-curtain"), { clipPath: "none" });
          const out = gsap.timeline();
          out
            .to(q(".tr-claw-bar"), { autoAlpha: 0, duration: 0.25 }, 0)
            .fromTo(q(".tr-curtain"), { "--r": "-160px" }, { "--r": `${r}px`, duration: 1.5, ease: "power2.inOut" }, 0.1);
          await wait(out);
          close();
        },

        // ───────── 2 · Papel ─────────
        async paper(cover) {
          open();
          const strips = q(".tr-strip");
          const tl = gsap.timeline();
          tl.fromTo(
            strips,
            { scaleY: 0, transformOrigin: "50% 0%" },
            { scaleY: 1, duration: 0.6, ease: "power3.inOut", stagger: { each: 0.05, from: "center" } }
          );
          await wait(tl);
          await cover();

          const out = gsap.timeline();
          out
            .set(strips, { transformOrigin: "50% 100%" })
            .to(strips, { scaleY: 0, duration: 0.7, ease: "power3.inOut", stagger: { each: 0.05, from: "edges" } });
          await wait(out);
          close();
        },

        // ───────── 3 · Nerviosismo ─────────
        async nervous(cover) {
          open();
          const chars = gsap.utils.toArray<HTMLElement>(".fchar");
          const lines = gsap.utils.toArray<HTMLElement>(".finale-text, .finale-note, .finale-sign");
          const btn = gsap.utils.toArray<HTMLElement>(".finale-actions .btn");
          const sun = gsap.utils.toArray<HTMLElement>(".sun");
          chars.forEach((c) => c.parentElement && (c.parentElement.style.overflow = "visible"));

          const tl = gsap.timeline();
          tl.to(q(".tr-vignette"), { opacity: 0.35, duration: 0.5 }, 0).to(
            q(".tr-vignette"),
            { opacity: 0.75, duration: 0.2, yoyo: true, repeat: 13, ease: "power2.inOut" },
            0.5
          );
          [2, 4, 7, 12].forEach((amp, i) => {
            const at = i * 0.7;
            const shake = (extra: gsap.TweenVars = {}) => ({
              x: `random(-${amp},${amp})`,
              y: `random(-${amp},${amp})`,
              duration: 0.05,
              repeat: 13,
              repeatRefresh: true,
              ease: "none",
              ...extra,
            });
            tl.to(chars, shake({ rotation: `random(-${amp * 1.5},${amp * 1.5})` }), at)
              .to([...lines, ...btn], shake(), at)
              .to(sun, { scale: 1 + i * 0.05, duration: 0.35, yoyo: true, repeat: 1, ease: "power2.out" }, at);
          });
          tl.to(btn, { scale: 1.14, duration: 0.18, yoyo: true, repeat: 9, ease: "sine.inOut" }, 0.4).fromTo(
            q(".tr-flash"),
            { opacity: 0 },
            { opacity: 1, duration: 0.14, ease: "power4.in" },
            2.75
          );
          await wait(tl);

          // Se limpia todo mientras el destello tapa la pantalla.
          gsap.set([...chars, ...lines, ...btn, ...sun], { clearProps: "x,y,rotation,scale" });
          chars.forEach((c) => c.parentElement && (c.parentElement.style.overflow = ""));
          await cover();

          const out = gsap.timeline();
          out.to(q(".tr-flash"), { opacity: 0, duration: 1.2, ease: "power2.out" }, 0).to(q(".tr-vignette"), { opacity: 0, duration: 0.8 }, 0);
          await wait(out);
          close();
        },

        // ───────── 4 · Amanecer ─────────
        async sunrise(cover) {
          open();
          const r = radius();
          const tl = gsap.timeline();
          tl.fromTo(
            q(".tr-sunrise"),
            { clipPath: "circle(0px at 50% 100%)" },
            { clipPath: `circle(${r}px at 50% 100%)`, duration: 1.7, ease: "power2.in" }
          );
          await wait(tl);
          await cover();

          const out = gsap.timeline();
          out.to(q(".tr-sunrise"), { autoAlpha: 0, duration: 2.2, ease: "power1.out" });
          await wait(out);
          close();
        },
      };
    },
    []
  );

  return (
    <div className="tr" ref={root} aria-hidden="true">
      <div className="tr-curtain" />
      {["26%", "50%", "74%"].map((top, i) => (
        <div className="tr-claw" key={top} style={{ top, transform: `rotate(${-24 + i * 3}deg)` }}>
          <div className="tr-claw-bar" />
        </div>
      ))}
      {Array.from({ length: STRIPS }, (_, i) => (
        <div className="tr-strip" key={i} style={{ "--i": i } as CSSProperties} />
      ))}
      <div className="tr-sunrise" />
      <div className="tr-vignette" />
      <div className="tr-flash" />
    </div>
  );
});

export default Transitions;
