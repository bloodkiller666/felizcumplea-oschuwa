"use client";

import { sfx } from "@/lib/sfx";

import { useRef, useState, type CSSProperties } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { burst, starCannon } from "@/lib/fx";
import { ARCANOS, POSITIONS } from "@/lib/tarot";
import Glyph from "../Glyph";

/*
  Tarot.exe: la tirada de tres cartas dentro de la pantalla de la PC.
  Todo se dimensiona con unidades de contenedor (cqw), así que cabe igual en el monitor de escritorio y en el vertical del móvil.
*/
export default function TarotWindow({ onExit }: { onExit: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const [picked, setPicked] = useState<number[] | null>(null);
  const [revealed, setRevealed] = useState<boolean[]>([false, false, false]);
  const [focus, setFocus] = useState<number | null>(null);
  const [shuffling, setShuffling] = useState(false);

  const { contextSafe } = useGSAP({ scope: root });
  const count = revealed.filter(Boolean).length;
  const all = picked !== null && count === 3;

  useGSAP(
    () => {
      gsap.from(".tz-deck .deck-card", { y: 60, rotation: (i) => (i - 2.5) * 5, autoAlpha: 0, stagger: 0.07, duration: 0.9, ease: "expo.out", delay: 0.2 });
      gsap.from(".tz-intro > *:not(.tz-deck)", { autoAlpha: 0, y: 14, stagger: 0.1, duration: 0.6, ease: "power3.out", delay: 0.5 });
    },
    { scope: root }
  );

  // Reparto: las tres cartas caen en su lugar.
  useGSAP(
    () => {
      if (!picked) return;
      gsap.from(".tz-slot", { y: -60, rotation: () => gsap.utils.random(-10, 10), autoAlpha: 0, stagger: 0.18, duration: 0.8, ease: "power3.out" });
      gsap.from(".tz-note", { autoAlpha: 0, y: 10, duration: 0.6, delay: 0.7 });
    },
    { dependencies: [picked], scope: root }
  );

  useGSAP(
    () => {
      if (!all) return;
      starCannon(0.5, 0.7);
      sfx.success();
      gsap.fromTo(".tz-reading", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.7, delay: 0.9, ease: "power3.out" });
      gsap.fromTo(".tz-exit", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.7, delay: 1.4, ease: "power3.out" });
    },
    { dependencies: [all], scope: root }
  );

  const draw = contextSafe(() => {
    if (shuffling) return;
    sfx.shuffle();
    setShuffling(true);
    const cards = gsap.utils.toArray<HTMLElement>(".tz-deck .deck-card", root.current);
    const side = (i: number) => (i % 2 ? 1 : -1);
    gsap
      .timeline({
        onComplete: () => {
          setPicked(
            ARCANOS.map((_, i) => i)
              .sort(() => Math.random() - 0.5)
              .slice(0, 3)
          );
          setShuffling(false);
        },
      })
      .to(cards, { x: (i) => side(i) * 70, rotation: (i) => side(i) * gsap.utils.random(6, 14), duration: 0.3, stagger: 0.04, ease: "power2.out" })
      .to(cards, { x: 0, rotation: 0, duration: 0.36, stagger: { each: 0.04, from: "end" }, ease: "power2.inOut" })
      .to(cards, { x: (i) => -side(i) * 60, duration: 0.28, stagger: 0.03, ease: "power2.out" }, "+=0.05")
      .to(cards, { x: 0, duration: 0.4, stagger: 0.03, ease: "back.out(1.7)" });
  });

  const reveal = contextSafe((i: number) => {
    if (!picked) return;
    setFocus(i);
    if (revealed[i]) return;
    const frame = root.current?.querySelector<HTMLElement>(`[data-slot="${i}"]`);
    if (!frame) return;
    sfx.flip();
    setRevealed((r) => r.map((v, k) => (k === i ? true : v)));
    gsap.to(frame.querySelector(".card-inner"), { rotationY: 180, duration: 0.9, ease: "power3.inOut" });
    gsap.fromTo(frame.querySelector(".tarot-card"), { y: 0 }, { y: -10, duration: 0.3, yoyo: true, repeat: 1, ease: "power2.out" });
    burst(frame, frame.clientWidth / 2, frame.clientHeight / 2, { count: 18, shape: "star", colors: [ARCANOS[picked[i]].hue, "#ffb86b", "#FFFFFF"], distance: 110, delay: 0.4 });
    gsap.fromTo(".tz-note", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.5, delay: 0.5 });
  });

  const shown = focus !== null && picked && revealed[focus] ? ARCANOS[picked[focus]] : null;

  return (
    <div className="tz" ref={root}>
      <div className="tz-body">
        {!picked ? (
          <div className="tz-intro">
            <div className="deck tz-deck" aria-hidden="true">
              {Array.from({ length: 6 }, (_, i) => (
                <div className="deck-card card-back" key={i} style={{ "--i": i } as CSSProperties}>
                  <Glyph type="star" />
                </div>
              ))}
            </div>
            <p className="tz-lede">Tres cartas: lo que te sostuvo, lo que eres hoy y lo que te espera. Aquí todas traen buenas noticias.</p>
            <button type="button" className="btn tz-draw" onClick={draw} disabled={shuffling} data-nofx>
              {shuffling ? "Barajando…" : "Barajar y sacar tres cartas"}
            </button>
          </div>
        ) : (
          <>
            <div className="tz-slots">
              {POSITIONS.map((pos, i) => {
                const card = ARCANOS[picked[i]];
                return (
                  <div className="tz-slot" key={pos}>
                    <div className="tz-frame" data-slot={i}>
                      <button
                        type="button"
                        className="tarot-card"
                        onClick={() => reveal(i)}
                        data-nofx
                        aria-label={revealed[i] ? `${card.name}: ${card.keyword}` : `${pos}: carta boca abajo, toca para voltearla`}
                      >
                        <span className="card-inner">
                          <span className="card-face card-back">
                            <Glyph type="star" />
                          </span>
                          <span className="card-face card-front" style={{ "--hue": card.hue } as CSSProperties}>
                            <span className="card-num">{card.numeral}</span>
                            <Glyph type={card.glyph} />
                            <span className="card-name">{card.name}</span>
                          </span>
                        </span>
                      </button>
                    </div>
                    <p className="tz-pos">{pos}</p>
                  </div>
                );
              })}
            </div>

            <div className="tz-note" aria-live="polite">
              {shown ? (
                <>
                  <h3>{shown.name}</h3>
                  <p>{shown.message}</p>
                </>
              ) : (
                <p className="tz-hint">Toca una carta para voltearla · {count} de 3</p>
              )}
            </div>

            {all && picked && (
              <div className="tz-reading">
                <p className="tz-line">{picked.map((id) => ARCANOS[id].keyword).join(" · ")}</p>
                <p>Sea cual sea el orden en que caigan, todas dicen lo mismo: vas bien, y no vas sola.</p>
              </div>
            )}
          </>
        )}
      </div>

      {all && (
        <div className="tz-exit">
          <button type="button" className="btn btn-go" onClick={onExit} data-nofx>
            Salir de PC
          </button>
        </div>
      )}
    </div>
  );
}
