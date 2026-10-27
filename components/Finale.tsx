"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { confettiRain, fireworks } from "@/lib/fx";
import { finale, person } from "@/lib/content";

export default function Finale({ onNext }: { onNext: () => void }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      // El sol sale mientras llegas al final.
      gsap.fromTo(
        ".sun",
        { yPercent: 70 },
        {
          yPercent: -6,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "center center", scrub: true },
        }
      );

      gsap.to(".sun-rays", { rotation: 360, duration: 90, ease: "none", repeat: -1 });
      gsap.to(".sun", { scale: 1.06, duration: 2.4, ease: "sine.inOut", repeat: -1, yoyo: true });

      const split = SplitText.create(".finale-title", { type: "chars,words", mask: "chars", charsClass: "fchar" });
      gsap.from(split.chars, {
        yPercent: 115,
        stagger: 0.025,
        duration: 0.9,
        ease: "power4.out",
        scrollTrigger: {
          trigger: ".finale-title",
          start: "top 80%",
          once: true,
          onEnter: () => {
            confettiRain(160);
            fireworks(2600);
          },
        },
      });

      gsap.from(".finale-text, .finale-note, .finale-sign, .finale-actions", {
        autoAlpha: 0,
        y: 24,
        stagger: 0.18,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: ".finale-text", start: "top 88%", once: true },
      });
    },
    { scope: root }
  );

  return (
    <section className="finale" id="final" ref={root}>
      <div className="sun" aria-hidden="true">
        <div className="sun-rays" />
      </div>
      <div className="finale-inner">
        <h2 className="finale-title">{finale.title}</h2>
        <p className="finale-text">{finale.text}</p>
        <p className="finale-note">{finale.note}</p>
        <p className="finale-sign">{person.signature}</p>
        <div className="finale-actions">
          <button type="button" className="btn btn-dark btn-lg" onClick={onNext}>
            Último regalo
          </button>
        </div>
      </div>
    </section>
  );
}
