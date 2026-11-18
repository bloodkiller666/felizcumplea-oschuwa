"use client";

import { sfx } from "@/lib/sfx";

import { useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { burst } from "@/lib/fx";
import MazeGame, { type Dir } from "./MazeGame";

type Phase = "off" | "boot" | "title" | "play" | "win";

const DIRS: { key: string; label: string; d: Dir }[] = [
  { key: "u", label: "Arriba", d: { dx: 0, dy: -1 } },
  { key: "d", label: "Abajo", d: { dx: 0, dy: 1 } },
  { key: "l", label: "Izquierda", d: { dx: -1, dy: 0 } },
  { key: "r", label: "Derecha", d: { dx: 1, dy: 0 } },
];

/*
  La Game Boy Advance: se enciende (logo que cae), muestra el título de Motoperro Maze y arranca el juego.
  Se controla con flechas/WASD, deslizando el dedo sobre la pantalla o con los botones de la consola.
*/
export default function Gba({ active, onExit }: { active: boolean; onExit: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const touch = useRef<Dir | null>(null);
  const [phase, setPhase] = useState<Phase>("off");
  const [deaths, setDeaths] = useState(0);
  const { contextSafe } = useGSAP({ scope: root });

  const power = contextSafe(() => {
    sfx.gbaBoot();
    setPhase("boot");
    if (prefersReducedMotion()) {
      setPhase("title");
      return;
    }
    // Como la consola de verdad: pantalla clara, el logo baja desde arriba y se asienta, un destello de colores lo recorre
    // y suena la campanita. Luego todo se desvanece.
    gsap
      .timeline({ onComplete: () => setPhase("title") })
      .fromTo(".gba-boot", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "none" })
      .fromTo(".gb-mark", { yPercent: -330 }, { yPercent: 0, duration: 1.05, ease: "power2.out" }, 0.1)
      .fromTo(".gb-logo", { backgroundPosition: "100% 0" }, { backgroundPosition: "0% 0", duration: 0.95, ease: "power1.inOut" }, 1.25)
      .fromTo(".gb-copy", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 1.4)
      .to(".gba-boot", { autoAlpha: 0, duration: 0.45, ease: "none" }, 3.15);
  });

  useGSAP(
    () => {
      if (phase !== "title") return;
      gsap.from(".gba-title > *", { autoAlpha: 0, y: 12, stagger: 0.12, duration: 0.6, ease: "power3.out" });
    },
    { dependencies: [phase], scope: root }
  );

  const win = contextSafe((n: number) => {
    sfx.win();
    setDeaths(n);
    setPhase("win");
    requestAnimationFrame(() => {
      const host = root.current?.querySelector<HTMLElement>(".gba-screen");
      if (host) burst(host, host.clientWidth / 2, host.clientHeight / 2, { count: 40, shape: "confetti", distance: 200, colors: ["#ffb86b", "#ff7aa8", "#7c93ff", "#fff1df"] });
      gsap.from(".gba-win > *", { autoAlpha: 0, y: 12, stagger: 0.12, duration: 0.6, delay: 0.2, ease: "power3.out" });
    });
  });

  const hold = (d: Dir | null) => () => {
    touch.current = d;
  };
  const pads = (cls: string) => (
    <div className={cls} role="group" aria-label="Cruceta">
      {DIRS.map((b) => (
        <button
          key={b.key}
          type="button"
          className={`pad-${b.key}`}
          aria-label={b.label}
          onPointerDown={hold(b.d)}
          onPointerUp={hold(null)}
          onPointerLeave={hold(null)}
          onPointerCancel={hold(null)}
          onContextMenu={(e) => e.preventDefault()}
        />
      ))}
    </div>
  );

  const playing = phase === "play" && active;

  return (
    <div className="gba" data-focus ref={root}>
      <div className="gba-screen-wrap">
        <div className="gba-screen" data-nofx>
          {phase === "off" && (
            <div className="dv-off">
              <button type="button" className="btn" onClick={power}>
                Encender
              </button>
            </div>
          )}

          {phase === "boot" && (
            <div className="gba-boot" aria-hidden="true">
              <div className="gb-mark">
                <strong className="gb-logo">GAME BOY</strong>
                <b className="gb-sub">ADVANCE</b>
              </div>
              <small className="gb-copy">© Motoperro Games</small>
            </div>
          )}

          {phase === "title" && (
            <div className="gba-title">
              <small>SHAKE ADVANCE presenta</small>
              <h3>Motoperro Maze</h3>
              <p>Lleva a Motoperro hasta el salmón ahumado. Cuidado con los tomates.</p>
              <button type="button" className="btn btn-go" onClick={() => {
                  sfx.click();
                  setPhase("play");
                }}>
                Jugar
              </button>
              <small className="gba-keys">Flechas o WASD · o desliza el dedo</small>
            </div>
          )}

          {(phase === "play" || phase === "win") && <MazeGame active={playing} touch={touch} onWin={win} />}

          {phase === "win" && (
            <div className="gba-win">
              <h3>¡Salmón ahumado para todos!</h3>
              <p>{deaths === 0 ? "Sin un solo tomatazo." : `Tomatazos esquivados… o no: ${deaths}.`}</p>
              <button type="button" className="btn btn-go" onClick={onExit} data-nofx>
                Salir de la Game Boy Advance
              </button>
            </div>
          )}
        </div>
      </div>

      {pads("gba-dpad")}
      <button type="button" className="gba-btn gba-a" aria-label="Botón A: jugar" onClick={() => phase === "title" && setPhase("play")}>
        A
      </button>
      <i className="gba-btn gba-b" aria-hidden="true">B</i>
      <i className="gba-pill gba-sel" aria-hidden="true" />
      <i className="gba-pill gba-sta" aria-hidden="true" />
      <i className={`gba-led${phase !== "off" ? " is-on" : ""}`} aria-hidden="true" />

    </div>
  );
}
