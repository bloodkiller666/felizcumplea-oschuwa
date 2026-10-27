"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { stops } from "@/lib/content";

const PAWS = 14;

function PawPrint({ tilt }: { tilt: number }) {
  return (
    <svg className="paw-svg" viewBox="0 0 40 46" style={{ transform: `rotate(${180 + tilt}deg)` }} aria-hidden="true">
      <g fill="currentColor">
        <ellipse cx="20" cy="32" rx="11" ry="9" />
        <ellipse cx="7" cy="20" rx="4.2" ry="5.5" transform="rotate(-18 7 20)" />
        <ellipse cx="16" cy="11" rx="4.2" ry="5.8" />
        <ellipse cx="24" cy="11" rx="4.2" ry="5.8" />
        <ellipse cx="33" cy="20" rx="4.2" ry="5.5" transform="rotate(18 33 20)" />
      </g>
    </svg>
  );
}

function PinkBike() {
  return (
    <svg className="ruta-bike" viewBox="0 -8 140 88" aria-hidden="true">
      <g className="ruta-bike-body">
        {/* escape y brazo trasero */}
        <path d="M30 54L52 58" stroke="#8d7ba8" strokeWidth="4" strokeLinecap="round" />
        <path d="M28 56L58 54" stroke="#dfe0ff" strokeWidth="4" strokeLinecap="round" />
        {/* cuerpo rosa */}
        <path
          d="M38 52Q42 36 60 34L84 34Q92 34 96 42L102 50L58 56Z"
          fill="#ff4fa3"
          stroke="#A82C5E"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M62 38Q72 36 84 38" stroke="#FFD3E3" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M44 36Q54 30 66 34" stroke="#dfe0ff" strokeWidth="5" strokeLinecap="round" fill="none" />
        <rect x="60" y="48" width="22" height="12" rx="3" fill="#a99bff" />
        {/* horquilla, manubrio y faro */}
        <path d="M96 30L112 56" stroke="#dfe0ff" strokeWidth="4" strokeLinecap="round" />
        <path d="M92 28L102 26" stroke="#dfe0ff" strokeWidth="4" strokeLinecap="round" />
        <circle cx="103" cy="40" r="4.5" fill="#ff7cc4" />
        {/* pantera piloto */}
        <path d="M52 34Q66 12 92 26" stroke="#B79CFF" strokeWidth="9" strokeLinecap="round" fill="none" />
        <circle cx="80" cy="15" r="9" fill="#B79CFF" />
        <path d="M73 9L72 0L79 6ZM86 7L89 -1L90 10Z" fill="#B79CFF" />
        <path className="ruta-bandana" d="M72 14Q58 8 44 18" stroke="#ff7cc4" strokeWidth="4" strokeLinecap="round" fill="none" />
      </g>
      <g className="ruta-wheel ruta-wheel-r">
        <circle cx="28" cy="56" r="17" stroke="#fdf0fa" strokeWidth="4" />
        <circle cx="28" cy="56" r="11" stroke="#a99bff" strokeWidth="1.5" />
        <path d="M28 45V67M17 56H39M20 48L36 64M36 48L20 64" stroke="#a99bff" strokeWidth="1.5" />
        <circle cx="28" cy="56" r="3" fill="#ff7cc4" />
      </g>
      <g className="ruta-wheel ruta-wheel-f">
        <circle cx="112" cy="56" r="17" stroke="#fdf0fa" strokeWidth="4" />
        <circle cx="112" cy="56" r="11" stroke="#a99bff" strokeWidth="1.5" />
        <path d="M112 45V67M101 56H123M104 48L120 64M120 48L104 64" stroke="#a99bff" strokeWidth="1.5" />
        <circle cx="112" cy="56" r="3" fill="#ff7cc4" />
      </g>
    </svg>
  );
}

export default function Ruta() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Escritorio: scroll horizontal anclado y una moto rosa que recorre la línea hasta el final.
      mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current;
        if (!el) return;
        const dist = () => Math.max(0, el.scrollWidth - window.innerWidth + 96);

        const ride = gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: () => "+=" + dist(),
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          })
          .to(el, { x: () => -dist() }, 0)
          .to(".ruta-progress", { scaleX: 1 }, 0)
          .fromTo(".ruta-bike", { left: "0%", xPercent: 0 }, { left: "100%", xPercent: -100 }, 0)
          .to(".ruta-wheel-r", { rotation: 5040, svgOrigin: "28 56" }, 0)
          .to(".ruta-wheel-f", { rotation: 5040, svgOrigin: "112 56" }, 0);

        // Cada parada se enciende al cruzar el centro (containerAnimation = el scroll horizontal).
        const horizontal = ride.scrollTrigger?.animation;
        gsap.utils.toArray<HTMLElement>(".stop").forEach((stop) => {
          gsap.fromTo(
            stop.querySelectorAll(".stop-num, .stop-title, .stop-text"),
            { autoAlpha: 0.12, y: 40, filter: "blur(6px)" },
            {
              autoAlpha: 1, y: 0, filter: "blur(0px)", stagger: 0.1, duration: 0.6, ease: "power3.out",
              scrollTrigger: { trigger: stop, containerAnimation: horizontal, start: "left 92%", end: "left 60%", scrub: true },
            }
          );
        });
        gsap.fromTo(".ruta-ghost", { xPercent: 0 }, { xPercent: -45, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: () => "+=" + dist(), scrub: true } });

        // La velocidad del scroll inclina el recorrido, como la moto al tomar una curva.
        const skew = gsap.quickTo(el, "skewX", { duration: 0.4, ease: "power3" });
        ScrollTrigger.create({
          trigger: root.current, start: "top top", end: () => "+=" + dist(),
          onUpdate: (self) => skew(gsap.utils.clamp(-6, 6, self.getVelocity() / -450)),
          onLeave: () => skew(0), onLeaveBack: () => skew(0),
        });

        // Detalles de vida: el pañuelo ondea y la moto vibra un poquito.
        gsap.to(".ruta-bandana", { rotation: 10, svgOrigin: "72 14", duration: 0.35, yoyo: true, repeat: -1, ease: "sine.inOut" });
        gsap.to(".ruta-bike-body", { y: -1.6, duration: 0.18, yoyo: true, repeat: -1, ease: "sine.inOut" });
      });

      // Móvil: solo huellas de pantera que van apareciendo a medida que bajas.
      mm.add("(max-width: 899.98px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.from(".paw", {
          autoAlpha: 0,
          scale: 0.2,
          stagger: 0.1,
          ease: "back.out(2)",
          scrollTrigger: { trigger: ".ruta-track", start: "top 70%", end: "bottom 80%", scrub: true },
        });
      });
    },
    { scope: root }
  );

  return (
    <div>
    <section className="ruta" id="ruta" ref={root}>
      <p className="ruta-ghost" aria-hidden="true">KILÓMETROS · CAMINO · AVANCE · KILÓMETROS · CAMINO · AVANCE</p>
      <div className="ruta-track" ref={track}>
        <div className="ruta-prints" aria-hidden="true">
          {Array.from({ length: PAWS }, (_, i) => (
            <span className="paw" key={i} style={{ alignSelf: i % 2 ? "flex-end" : "flex-start" }}>
              <PawPrint tilt={i % 2 ? 12 : -12} />
            </span>
          ))}
        </div>
        <div className="ruta-intro">
          <h2 className="section-title">Kilómetros de este año</h2>
          <p className="lede">Desliza y recorre lo que cargaste, lo que soltaste y lo que lograste.</p>
        </div>
        {stops.map((s, i) => (
          <article className="stop" key={s.title}>
            <span className="stop-num" aria-hidden="true">{i + 1}</span>
            <h3 className="stop-title">{s.title}</h3>
            <p className="stop-text">{s.text}</p>
          </article>
        ))}
      </div>
      <div className="ruta-line" aria-hidden="true">
        <div className="ruta-progress" />
        <PinkBike />
      </div>
    </section>
    </div>
  );
}
