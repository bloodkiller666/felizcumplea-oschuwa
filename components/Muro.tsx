"use client";

import { useRef, type CSSProperties } from "react";
import { gsap, Draggable, useGSAP } from "@/lib/gsap";
import { revealSection } from "@/lib/reveal";
import { notes } from "@/lib/content";

export default function Muro() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      revealSection(root.current);
      const board = root.current?.querySelector<HTMLElement>(".muro-board");
      const items = gsap.utils.toArray<HTMLElement>(".nota", root.current);
      if (!board || !items.length) return;

      gsap.set(items, { rotation: (i: number) => notes[i].r });

      let z = 10;
      Draggable.create(items, {
        type: "x,y",
        bounds: board,
        inertia: true,
        edgeResistance: 0.8,
        onDrag() {
          gsap.to(this.target, { rotation: gsap.utils.clamp(-14, 14, this.deltaX * 0.9), duration: 0.25, overwrite: "auto" });
        },
        onThrowUpdate() {
          gsap.to(this.target, { rotation: gsap.utils.clamp(-14, 14, this.deltaX * 0.9), duration: 0.25, overwrite: "auto" });
        },
        onPress() {
          z += 1;
          gsap.set(this.target, { zIndex: z });
          gsap.to(this.target, { scale: 1.07, rotation: 0, duration: 0.2 });
        },
        onRelease() {
          gsap.to(this.target, { scale: 1, duration: 0.5, ease: "elastic.out(1,.5)" });
          gsap.to(this.target, { rotation: gsap.utils.random(-5, 5), duration: 1.1, delay: 0.3, ease: "elastic.out(1,.4)" });
        },
      });

      // Respiración suave: cada nota flota un poco cuando nadie la toca.
      items.forEach((el, i) => gsap.to(el.querySelector("p"), { y: "random(-3,3)", duration: 2.4 + i * 0.2, repeat: -1, yoyo: true, ease: "sine.inOut" }));

      gsap.from(items, {
        autoAlpha: 0,
        y: 60,
        rotation: () => gsap.utils.random(-22, 22),
        stagger: 0.1,
        duration: 0.9,
        ease: "back.out(1.5)",
        scrollTrigger: { trigger: board, start: "top 78%", once: true },
      });
    },
    { scope: root }
  );

  return (
    <section className="section muro" id="muro" data-ghost="CARIÑO" ref={root}>
      <h2 className="section-title">Muro de cariño</h2>
      <p className="lede">Arrastra las notas por el muro. Cada una es un abrazo.</p>
      <div className="muro-board" data-lenis-prevent>
        {notes.map((n) => (
          <div
            key={n.text}
            data-nofx
            className={`nota nota-${n.tone}`}
            style={{ "--x": `${n.x}%`, "--y": `${n.y}%` } as CSSProperties}
          >
            <p>{n.text}</p>
            <span className="nota-from">{n.from}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
