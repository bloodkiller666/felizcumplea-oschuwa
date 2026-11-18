"use client";

import { sfx } from "@/lib/sfx";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { pcCopy, stranger } from "@/lib/room";
import TarotWindow from "./TarotWindow";
import { GiftsWindow, ChatWindow, CakeWindow, FarewellWindow } from "./PcEnding";

export type PcState =
  | "off" | "boot" | "desktop" | "msg" | "tarot"
  | "stranger" | "gifts" | "chat" | "cake" | "farewell" | "shutdown" | "down";

const PowerIcon = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
    <path d="M12 3v8M6.3 6.8a8 8 0 1 0 11.4 0" />
  </svg>
);

const TITLES: Partial<Record<PcState, string>> = {
  gifts: "Mensajes · Desconocido",
  chat: "Stream.exe · EN VIVO",
  cake: "Stream.exe · Cámara de la fiesta",
  farewell: "Mensajes · Shake Gang",
};

/*
  La PC gamer.
  Capítulo 1: se enciende con un clic, "arranca" (BIOS → logo → escritorio), recibe un mensaje que hay que abrir con el mouse
  y termina en la tirada de tarot. Al salir no se apaga.
  Capítulo 2 (al volver de la Switch): la cámara "entra" sola en la pantalla y llega un mensaje de un desconocido con los tres regalos;
  después el chat del stream, el pastel y la despedida, que termina con el botón "Apagar PC": la pantalla se apaga y la cámara sale hacia la puerta.
*/
export default function PcStation({
  initial = "off",
  chapter,
  active,
  onExit,
  onEnding,
}: {
  initial?: PcState;
  chapter: 1 | 2;
  active: boolean;
  onExit: () => void;
  onEnding: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<PcState>(initial);
  const started2 = useRef(false);
  const { contextSafe } = useGSAP({ scope: root });

  const powerOn = contextSafe(() => {
    sfx.power();
    setState("boot");
  });

  // Capítulo 2: al llegar la cámara, el aviso del desconocido se abre solo (sin botones).
  useEffect(() => {
    if (chapter !== 2 || !active || started2.current || ["chat", "cake", "farewell"].includes(initial)) return; // (en desarrollo, ?pc=farewell salta directo al final)
    started2.current = true;
    sfx.ding();
    setState("stranger");
    const t = window.setTimeout(() => setState("gifts"), prefersReducedMotion() ? 600 : 2600);
    return () => clearTimeout(t);
  }, [chapter, active]);

  // Arranque: la luz de fondo sube, salen las líneas del BIOS, luego el logo con su barra y el escritorio.
  useGSAP(
    () => {
      if (state !== "boot") return;
      const lines = gsap.utils.toArray<HTMLElement>(".pc-bios p", root.current);
      if (prefersReducedMotion()) {
        setState("desktop");
        return;
      }
      gsap
        .timeline({ onComplete: () => setState("desktop") })
        .fromTo(".pc-boot", { opacity: 0 }, { opacity: 1, duration: 0.15, repeat: 3, yoyo: true, ease: "steps(1)" })
        .set(".pc-boot", { opacity: 1 })
        .from(lines, { autoAlpha: 0, x: -8, stagger: 0.28, duration: 0.01 }, "+=0.15")
        .to(".pc-bios", { autoAlpha: 0, duration: 0.3 }, "+=0.5")
        .fromTo(".pc-logo", { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: "power3.out" })
        .add(() => sfx.boot(), "<")
        .fromTo(".pc-bar i", { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: "power1.inOut" }, "<0.2")
        .to(".pc-boot", { autoAlpha: 0, duration: 0.5 }, "+=0.3");
    },
    { dependencies: [state], scope: root }
  );

  // Escritorio: llega el mensaje nuevo (aviso que hay que pulsar con el mouse).
  useGSAP(
    () => {
      if (state !== "desktop") return;
      gsap.from(".pc-icons > *", { autoAlpha: 0, y: 10, stagger: 0.08, duration: 0.5, ease: "power2.out" });
      gsap.from(".pc-taskbar", { yPercent: 100, duration: 0.6, ease: "power3.out" });
      gsap.fromTo(".pc-toast", { autoAlpha: 0, y: 40, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, delay: prefersReducedMotion() ? 0 : 1.6, ease: "back.out(1.6)" });
      gsap.delayedCall(prefersReducedMotion() ? 0 : 1.6, () => sfx.ding());
    },
    { dependencies: [state], scope: root }
  );

  useGSAP(
    () => {
      if (state === "stranger") gsap.fromTo(".pc-toast", { autoAlpha: 0, y: 40, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.6)" });
      if (state === "msg") {
        gsap.from(".pc-win", { autoAlpha: 0, scale: 0.92, y: 16, duration: 0.5, ease: "back.out(1.5)" });
        gsap.from(".pc-mail-body > *", { autoAlpha: 0, y: 10, stagger: 0.55, duration: 0.6, delay: 0.5, ease: "power2.out" });
      }
      if (["gifts", "chat", "cake", "farewell"].includes(state)) gsap.from(".pc-win", { autoAlpha: 0, scale: 0.94, y: 14, duration: 0.5, ease: "power3.out" });
    },
    { dependencies: [state], scope: root }
  );

  const open = contextSafe(() => {
    sfx.click();
    setState("msg");
  });
  const tryLuck = contextSafe(() => {
    sfx.click();
    gsap.to(".pc-win", { autoAlpha: 0, scale: 0.94, duration: 0.3, onComplete: () => setState("tarot") });
  });

  // Apagar: la pantalla se va a negro con una barrita y avisa a la cámara para que salga del escritorio.
  // (con setTimeout y no con gsap: lo llama la despedida, y su contexto de GSAP se limpia al desmontarse)
  const shutDown = () => {
    sfx.click();
    setState("shutdown");
    const quick = prefersReducedMotion();
    window.setTimeout(() => {
      sfx.power();
      setState("down");
      window.setTimeout(onEnding, quick ? 200 : 1100);
    }, quick ? 300 : 2400);
  };

  const lit = state !== "off" && state !== "down";
  const onDesktop = state !== "off" && state !== "boot" && state !== "down";
  const overlay = state === "shutdown";

  return (
    <div className={`monitor${lit ? " is-on" : ""}`} ref={root}>
      <div className="rgb-glow" aria-hidden="true" />
      <div className="bezel">
        <div className="pcscreen" data-focus data-nofx>
          {state === "down" && <div className="pc-off pc-down" aria-hidden="true" />}

          {state === "off" && (
            <div className="pc-off">
              <button type="button" className="btn btn-lg pc-power" onClick={powerOn}>
                <PowerIcon />
                <span>Encender PC</span>
              </button>
            </div>
          )}

          {state === "boot" && (
            <div className="pc-boot" aria-hidden="true">
              <div className="pc-bios">
                {pcCopy.boot.map((l) => (
                  <p key={l}>{l}</p>
                ))}
              </div>
              <div className="pc-logo">
                <strong>Shake OS</strong>
                <span className="pc-bar">
                  <i />
                </span>
              </div>
            </div>
          )}

          {onDesktop && (
            <div className="pc-desktop">
              <div className="pc-wall" aria-hidden="true" />
              <div className="pc-icons" aria-hidden="true">
                <span><i className="ic ic-stream" />Stream</span>
                <span><i className="ic ic-folder" />Fotos</span>
                <span><i className="ic ic-bin" />Papelera</span>
              </div>

              {state === "desktop" && (
                <button type="button" className="pc-toast" onClick={open} data-nofx>
                  <span className="pc-toast-ic" aria-hidden="true" />
                  <span className="pc-toast-tx">
                    <small>Mensaje nuevo</small>
                    <b>{pcCopy.sender}</b>
                    <em>{pcCopy.subject}</em>
                  </span>
                </button>
              )}

              {state === "stranger" && (
                <div className="pc-toast pc-toast-auto" role="status">
                  <span className="pc-toast-ic pc-toast-unk" aria-hidden="true">?</span>
                  <span className="pc-toast-tx">
                    <small>Mensaje nuevo</small>
                    <b>{stranger.from}</b>
                    <em>{stranger.subject}</em>
                  </span>
                </div>
              )}

              {state === "msg" && (
                <div className="pc-win" role="dialog" aria-label={`Mensaje de ${pcCopy.sender}`}>
                  <header className="pc-bar-title">
                    <span>Mensajes · {pcCopy.sender}</span>
                    <i aria-hidden="true">— ▢ ✕</i>
                  </header>
                  <div className="pc-mail">
                    <h3>{pcCopy.subject}</h3>
                    <div className="pc-mail-body">
                      {pcCopy.body.map((p) => (
                        <p key={p}>{p}</p>
                      ))}
                      <button type="button" className="btn btn-go" onClick={tryLuck} data-nofx>
                        {pcCopy.cta}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {state === "tarot" && (
                <div className="pc-win pc-win-max" role="dialog" aria-label="Tarot">
                  <header className="pc-bar-title">
                    <span>Tarot.exe · La tirada de la pantera</span>
                    <i aria-hidden="true">— ▢ ✕</i>
                  </header>
                  <TarotWindow onExit={onExit} />
                </div>
              )}

              {(state === "gifts" || state === "chat" || state === "cake" || state === "farewell") && (
                <div className="pc-win pc-win-max pc-win-dark" role="dialog" aria-label={TITLES[state]}>
                  <header className="pc-bar-title">
                    <span>{TITLES[state]}</span>
                    <i aria-hidden="true">— ▢ ✕</i>
                  </header>
                  {state === "gifts" && <GiftsWindow onDone={() => setState("chat")} />}
                  {state === "chat" && <ChatWindow onDone={() => setState("cake")} />}
                  {state === "cake" && <CakeWindow onDone={() => setState("farewell")} />}
                  {state === "farewell" && <FarewellWindow onDone={shutDown} />}
                </div>
              )}

              {state === "shutdown" && (
                <div className="pc-shutdown" role="status">
                  <strong>Apagando…</strong>
                  <span className="pc-bar"><i /></span>
                </div>
              )}

              {!overlay && (
                <footer className="pc-taskbar" aria-hidden="true">
                  <span className="pc-start">Shake</span>
                  <span className="pc-tray">
                    <i className={`pc-mail-ic${state === "desktop" || state === "stranger" ? " is-new" : ""}`} />
                    <time>23:47</time>
                  </span>
                </footer>
              )}
            </div>
          )}
        </div>
        <i className="pc-led" aria-hidden="true" />
      </div>
      <div className="neck" aria-hidden="true" />
      <div className="base" aria-hidden="true" />
    </div>
  );
}
