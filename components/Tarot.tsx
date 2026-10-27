"use client";

import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { revealSection } from "@/lib/reveal";
import { burst, starCannon } from "@/lib/fx";
import { ARCANOS, POSITIONS } from "@/lib/tarot";
import Glyph from "./Glyph";

export default function Tarot() {
  const root = useRef<HTMLElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const [picked, setPicked] = useState<number[] | null>(null);
  const [revealed, setRevealed] = useState<boolean[]>([false, false, false]);
  const [shuffling, setShuffling] = useState(false);

  const { contextSafe } = useGSAP({ scope: root });
  const allRevealed = picked !== null && revealed.every(Boolean);

  // El mazo aparece al llegar a la sección.
  useGSAP(
    () => {
      revealSection(root.current);
      gsap.from(".deck-card", {
        y: 70,
        autoAlpha: 0,
        stagger: 0.07,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: ".tarot-deck", start: "top 85%", once: true },
      });
    },
    { scope: root }
  );

  // Reparto: cada carta vuela desde el mazo hasta su lugar.
  useGSAP(
    () => {
      if (!picked || !deckRef.current) return;
      const deck = deckRef.current.getBoundingClientRect();
      gsap.utils.toArray<HTMLElement>(".tarot-card", root.current).forEach((card, i) => {
        const r = card.getBoundingClientRect();
        gsap.from(card, {
          x: deck.left + deck.width / 2 - (r.left + r.width / 2),
          y: deck.top + deck.height / 2 - (r.top + r.height / 2),
          rotation: gsap.utils.random(-14, 14),
          scale: 0.8,
          duration: 0.9,
          delay: i * 0.24,
          ease: "power3.out",
        });
      });
    },
    { dependencies: [picked], scope: root }
  );

  // El texto de cada carta aparece después de voltearla.
  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>(".slot-reveal:not([data-shown])", root.current).forEach((el) => {
        el.setAttribute("data-shown", "1");
        gsap.fromTo(el, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.7, delay: 0.55, ease: "power3.out" });
      });
    },
    { dependencies: [revealed], scope: root }
  );

  // Lectura final.
  useGSAP(
    () => {
      if (!allRevealed) return;
      starCannon(0.5, 0.7);
      gsap.fromTo(".reading", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.9, delay: 1.2, ease: "power3.out" });
    },
    { dependencies: [allRevealed], scope: root }
  );

  const draw = contextSafe(() => {
    if (shuffling) return;
    setShuffling(true);
    setPicked(null);
    setRevealed([false, false, false]);

    const cards = gsap.utils.toArray<HTMLElement>(".deck-card", root.current);
    const side = (i: number) => (i % 2 ? 1 : -1);

    gsap
      .timeline({
        onComplete: () => {
          const ids = ARCANOS.map((_, i) => i)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
          setPicked(ids);
          setShuffling(false);
        },
      })
      .to(cards, { x: (i) => side(i) * 110, rotation: (i) => side(i) * gsap.utils.random(6, 14), duration: 0.32, stagger: 0.04, ease: "power2.out" })
      .to(cards, { x: 0, rotation: 0, duration: 0.4, stagger: { each: 0.04, from: "end" }, ease: "power2.inOut" })
      .to(cards, { x: (i) => -side(i) * 90, duration: 0.3, stagger: 0.03, ease: "power2.out" }, "+=0.05")
      .to(cards, { x: 0, duration: 0.45, stagger: 0.03, ease: "back.out(1.7)" });
  });

  // Inclinación 3D y brillo holográfico que siguen al puntero.
  const tilt = contextSafe((e: ReactPointerEvent<HTMLElement>) => {
    if (e.pointerType === "touch") return;
    const card = e.currentTarget.querySelector<HTMLElement>(".tarot-card");
    if (!card) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    card.style.setProperty("--mx", `${x * 100}%`);
    card.style.setProperty("--my", `${y * 100}%`);
    gsap.to(card, { rotationY: (x - 0.5) * 22, rotationX: (0.5 - y) * 22, transformPerspective: 900, duration: 0.35, ease: "power2.out" });
  });
  const untilt = contextSafe((e: ReactPointerEvent<HTMLElement>) => {
    const card = e.currentTarget.querySelector<HTMLElement>(".tarot-card");
    if (card) gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.8, ease: "elastic.out(1,.6)" });
  });

  const reveal = contextSafe((i: number) => {
    if (!picked || revealed[i]) return;
    const card = ARCANOS[picked[i]];
    const frame = root.current?.querySelector<HTMLElement>(`[data-slot="${i}"]`);
    if (!frame) return;

    setRevealed((r) => r.map((v, k) => (k === i ? true : v)));
    gsap.to(frame.querySelector(".card-inner"), { rotationY: 180, duration: 1, ease: "power3.inOut" });
    gsap.fromTo(frame.querySelector(".tarot-card"), { y: 0 }, { y: -14, duration: 0.35, yoyo: true, repeat: 1, ease: "power2.out" });
    burst(frame, frame.clientWidth / 2, frame.clientHeight / 2, {
      count: 24,
      shape: "star",
      colors: [card.hue, "#ff7cc4", "#FFFFFF"],
      distance: 150,
      delay: 0.45,
    });
  });

  return (
    <section className="section tarot" id="tarot" data-ghost="REFLEXIÓN" ref={root}>
      <h2 className="section-title">Tarot de la pantera</h2>
      <p className="lede">
        Barajamos catorce cartas hechas para ti. Saca tres y voltéalas con calma. Aquí todas las cartas traen buenas noticias.
      </p>

      <div className="tarot-deck">
        <div className="deck" ref={deckRef} aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <div className="deck-card card-back" key={i} style={{ "--i": i } as CSSProperties}>
              <Glyph type="star" />
            </div>
          ))}
        </div>
        <button type="button" className="btn" onClick={draw} disabled={shuffling}>
          {shuffling ? "Barajando…" : picked ? "Barajar de nuevo" : "Barajar y sacar tres cartas"}
        </button>
      </div>

      <div className="tarot-slots">
        {POSITIONS.map((pos, i) => {
          const card = picked ? ARCANOS[picked[i]] : null;
          return (
            <div className="slot" key={pos}>
              <div className="slot-frame" data-slot={i} onPointerMove={tilt} onPointerLeave={untilt}>
                {card && (
                  <button
                    type="button"
                    className="tarot-card"
                    onClick={() => reveal(i)}
                    aria-label={revealed[i] ? `${card.name}: ${card.keyword}` : `${pos}: carta boca abajo, toca para voltearla`}
                  >
                    <span className="card-inner">
                      <span className="card-face card-back">
                        <Glyph type="star" />
                        <span className="card-sheen" />
                      </span>
                      <span className="card-face card-front" style={{ "--hue": card.hue } as CSSProperties}>
                        <span className="card-num">{card.numeral}</span>
                        <Glyph type={card.glyph} />
                        <span className="card-name">{card.name}</span>
                        <span className="card-sheen" />
                      </span>
                    </span>
                  </button>
                )}
              </div>
              <p className="slot-label">{pos}</p>
              {card && revealed[i] && (
                <div className="slot-reveal">
                  <h3>{card.name}</h3>
                  <p>{card.message}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {allRevealed && picked && (
        <div className="reading" aria-live="polite">
          <p className="reading-line">{picked.map((id) => ARCANOS[id].keyword).join("  ·  ")}</p>
          <p>Sea cual sea el orden en que caigan las cartas, todas dicen lo mismo: vas bien, y no vas sola.</p>
        </div>
      )}
    </section>
  );
}
