"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { startLenis, stopLenis, scrollToY } from "@/lib/lenis";
import { acts } from "@/lib/content";
import Atmosphere from "./Atmosphere";
import ActBreak from "./ActBreak";
import Hero from "./Hero";
import Book from "./Book";
import Tarot from "./Tarot";
import Ruta from "./Ruta";
import Batazo from "./Batazo";
import Muro from "./Muro";
import Dialogo from "./Dialogo";
import Finale from "./Finale";
import Regalos from "./Regalos";
import Epilogue from "./Epilogue";
import Transitions, { type TransitionHandle } from "./Transitions";

/*
  Etapas del recorrido (las secciones nuevas solo existen cuando se desbloquean):
  0 portada · 1 libro · 2 tarot → plática → cumpleaños · 3 último regalo · 4 despedida
*/

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
const topOf = (id: string) => {
  const el = document.getElementById(id);
  return el ? el.getBoundingClientRect().top + window.scrollY : 0;
};
const smoothTo = (id: string) => scrollToY(topOf(id), false);

export default function Experience() {
  const [stage, setStage] = useState(0);
  const stageRef = useRef(0);
  const busy = useRef(false);
  const tr = useRef<TransitionHandle>(null);

  // Scroll suave con Lenis, sincronizado con ScrollTrigger.
  useEffect(() => {
    startLenis();
    return stopLenis;
  }, []);

  // Monta la etapa nueva (mientras la transición tapa la pantalla) y salta a su sección.
  const commit = async (next: number, jumpTo: string | null) => {
    flushSync(() => setStage(next));
    stageRef.current = next;
    await nextFrame();
    ScrollTrigger.refresh();
    scrollToY(jumpTo ? topOf(jumpTo) : 0);
  };

  // ───────── Portada → Libro ─────────
  const startBook = async (x: number, y: number) => {
    if (busy.current) return;
    busy.current = true;

    // La portada se desintegra: las letras salen disparadas y la pantera se acerca.
    const chars = gsap.utils.toArray<HTMLElement>(".hero-title .char");
    chars.forEach((c) => c.parentElement && (c.parentElement.style.overflow = "visible"));
    gsap.to(chars, {
      x: () => gsap.utils.random(-320, 320),
      y: () => gsap.utils.random(-260, 260),
      rotation: () => gsap.utils.random(-220, 220),
      autoAlpha: 0,
      duration: 0.9,
      ease: "power3.in",
      stagger: { each: 0.012, from: "random" },
    });
    gsap.to(".panther-wrap", { scale: 1.45, autoAlpha: 0, duration: 0.9, ease: "power2.in" });
    gsap.to(".hero-sub, .hero-cta", { autoAlpha: 0, y: -30, duration: 0.5, ease: "power2.in" });
    gsap.to(".headlight", { scale: 2.4, duration: 1.1, ease: "power2.in" });

    await tr.current?.claw(x, y, () => commit(1, null));
    busy.current = false;
  };

  // ───────── Libro → Tarot ─────────
  const toTarot = async () => {
    if (stageRef.current >= 2) {
      smoothTo("act-2");
      return;
    }
    if (busy.current) return;
    busy.current = true;

    gsap.to(".book-stage", { y: -50, scale: 0.88, autoAlpha: 0, duration: 0.7, ease: "power2.in" });
    await tr.current?.paper(async () => {
      gsap.set(".book-stage", { clearProps: "transform,opacity,visibility" });
      await commit(2, "act-2");
    });
    busy.current = false;
  };

  // ───────── Cumpleaños → Último regalo ─────────
  const toGifts = async () => {
    if (stageRef.current >= 3) {
      smoothTo("regalos");
      return;
    }
    if (busy.current) return;
    busy.current = true;
    await tr.current?.nervous(() => commit(3, "regalos"));
    busy.current = false;
  };

  // ───────── Último regalo → Despedida (sin vuelta atrás) ─────────
  const toEpilogue = async () => {
    if (busy.current) return;
    busy.current = true;
    await tr.current?.sunrise(() => commit(4, null));
    busy.current = false;
  };

  return (
    <main>
      <Atmosphere stage={stage} />

      {stage === 0 && <Hero onStart={startBook} />}
      {stage >= 1 && stage <= 3 && (
        <div data-act="1">
          <ActBreak act={acts[0]} />
          <Book onNext={toTarot} />
        </div>
      )}
      {stage >= 2 && stage <= 3 && (
        <>
          <div data-act="2">
            <ActBreak act={acts[1]} />
            <Tarot />
            <Ruta />
          </div>
          <div data-act="3">
            <ActBreak act={acts[2]} />
            <Batazo />
            <Muro />
            <Dialogo />
          </div>
          <div data-act="4">
            <ActBreak act={acts[3]} />
            <Finale onNext={toGifts} />
          </div>
        </>
      )}
      {stage === 3 && <div data-act="4"><Regalos onDone={toEpilogue} /></div>}
      {stage === 4 && <div data-act="4"><Epilogue /></div>}

      <Transitions ref={tr} />
    </main>
  );
}
