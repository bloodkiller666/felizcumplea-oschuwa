"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { revealSection } from "@/lib/reveal";
import { burst, starCannon, fireworks } from "@/lib/fx";
import { lockScroll } from "@/lib/lenis";
import { gifts, giftFinalLabel, bitOptions } from "@/lib/content";

type Third = "locked" | "x" | "done";
type ModalPhase = null | "choose" | "loading" | "message";

const LOADING_MESSAGES = ["Conectando con el stream…", "Verificando los bits…", "Preparando el broche de oro…"];

export default function Regalos({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLElement>(null);
  const [marks, setMarks] = useState<boolean[]>([false, false]);
  const [third, setThird] = useState<Third>("locked");
  const [label3, setLabel3] = useState(gifts[2]);
  const [modal, setModal] = useState<ModalPhase>(null);
  const [bits, setBits] = useState<string | null>(null);

  const { contextSafe } = useGSAP({ scope: root });

  const row = (i: number) => root.current?.querySelector<HTMLElement>(`[data-gift="${i}"]`) ?? null;

  useGSAP(
    () => {
      revealSection(root.current);
      gsap.set(".mark-path", { drawSVG: "0%" });
      gsap.from(".gift-row", {
        autoAlpha: 0,
        x: -50,
        stagger: 0.16,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: ".gifts", start: "top 88%", once: true },
      });
    },
    { scope: root }
  );

  // Animación de cada fase del modal.
  useGSAP(
    () => {
      if (!modal) return;
      const q = gsap.utils.selector(root);
      if (modal === "choose") gsap.fromTo(q(".modal-backdrop"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 });
      gsap.fromTo(q(".modal"), { scale: 0.8, y: 30, autoAlpha: 0 }, { scale: 1, y: 0, autoAlpha: 1, duration: 0.5, ease: "back.out(1.8)" });

      if (modal === "choose") {
        gsap.from(q(".bit-btn"), { y: 24, autoAlpha: 0, stagger: 0.1, duration: 0.5, delay: 0.25, ease: "back.out(1.7)" });
      }
      if (modal === "loading") {
        gsap.to(q(".spinner"), { rotation: 360, duration: 0.9, repeat: -1, ease: "none" });
        gsap.fromTo(q(".loading-bar-fill"), { scaleX: 0 }, { scaleX: 1, duration: 3.3, ease: "power1.inOut" });
        const msg = q(".loading-msg")[0];
        if (msg) {
          const tl = gsap.timeline();
          LOADING_MESSAGES.forEach((t, i) => tl.call(() => { msg.textContent = t; }, undefined, i * 1.1));
        }
      }
    },
    { dependencies: [modal], scope: root }
  );

  // Mientras el modal está abierto no se puede hacer scroll.
  useEffect(() => {
    if (!modal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lockScroll(true);
    return () => {
      lockScroll(false);
      document.body.style.overflow = prev;
    };
  }, [modal]);

  const failThird = contextSafe(() => {
    const r = row(2);
    if (!r) return;
    setThird("x");
    gsap
      .timeline()
      .fromTo(r, { x: 0 }, { x: "random(-9,9)", duration: 0.06, repeat: 11, repeatRefresh: true, ease: "none" })
      .to(r, { x: 0, duration: 0.08 })
      .fromTo(r.querySelector(".mark-x"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.55, ease: "power3.out" })
      .add(() => setModal("choose"), "+=1.3");
  });

  const markGift = contextSafe((i: 0 | 1) => {
    if (marks[i] || third !== "locked") return;
    const r = row(i);
    const next = marks.map((m, k) => (k === i ? true : m));
    setMarks(next);
    if (r) {
      gsap.fromTo(r.querySelector(".mark-check"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.6, ease: "power2.out" });
      gsap.fromTo(r, { scale: 1 }, { scale: 1.03, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" });
      burst(r, r.clientWidth - 40, r.clientHeight / 2, { count: 16, shape: "star", colors: ["#1faa6b", "#ff7cc4", "#FFFFFF"], distance: 90 });
    }
    if (next[0] && next[1]) gsap.delayedCall(1.2, failThird);
  });

  const chooseBits = contextSafe((option: string) => {
    setBits(option);
    setModal("loading");
    gsap.delayedCall(3.4, () => setModal("message"));
  });

  const finish = contextSafe(() => {
    const r = row(2);
    if (!r) return;
    setThird("done");
    gsap.to(r.querySelector(".mark-x"), { autoAlpha: 0, duration: 0.3 });
    gsap.to(r.querySelector(".gift-label"), {
      duration: 1.8,
      scrambleText: { text: giftFinalLabel, chars: "upperAndLowerCase", revealDelay: 0.4, speed: 0.6 },
      onComplete: () => setLabel3(giftFinalLabel),
    });
    gsap.fromTo(r.querySelector(".mark-check"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.7, delay: 1, ease: "power2.out" });
    gsap.fromTo(".gift-row", { scale: 1 }, { scale: 1.03, duration: 0.25, yoyo: true, repeat: 1, stagger: 0.14, delay: 1.2 });
    burst(r, r.clientWidth - 40, r.clientHeight / 2, { count: 40, shape: "star", distance: 200, delay: 1.1 });
    gsap.delayedCall(1.2, () => {
      starCannon(0.5, 0.5);
      fireworks(2400);
    });
    gsap.delayedCall(4.2, onDone);
  });

  const accept = contextSafe(() => {
    gsap.to(".modal-backdrop", {
      autoAlpha: 0,
      duration: 0.4,
      onComplete: () => {
        setModal(null);
        finish();
      },
    });
  });

  const stateOf = (i: number) => {
    if (i < 2) return marks[i] ? "is-checked" : "";
    return third === "x" ? "is-failed" : third === "done" ? "is-checked is-final" : "is-locked";
  };
  const noteOf = (i: number) => {
    if (i < 2) return marks[i] ? "Recibido" : "Toca para marcar";
    return third === "x" ? "No recibido" : third === "done" ? "¡Recibido!" : "Bloqueado";
  };

  return (
    <section className="section regalos" id="regalos" data-ghost="REGALO" ref={root}>
      <h2 className="section-title">Último regalo</h2>
      <p className="lede">Marca los regalos que ya recibiste esta noche.</p>

      <ul className="gifts">
        {gifts.map((g, i) => (
          <li key={g}>
            <button
              type="button"
              className={`gift-row ${stateOf(i)}`}
              data-gift={i}
              data-nofx
              disabled={i === 2 || marks[i as 0 | 1]}
              onClick={() => i < 2 && markGift(i as 0 | 1)}
              aria-label={`${i === 2 ? label3 : g}: ${noteOf(i)}`}
            >
              <span className="gift-num" aria-hidden="true">{i + 1}</span>
              <span className="gift-body">
                <span className="gift-label">{i === 2 ? label3 : g}</span>
                <span className="gift-note">{noteOf(i)}</span>
              </span>
              <span className="gift-mark">
                {i === 2 && third === "locked" && (
                  <svg className="lock" viewBox="0 0 44 44" aria-hidden="true">
                    <rect x="9" y="19" width="26" height="18" rx="4" />
                    <path d="M15 19v-5a7 7 0 0 1 14 0v5" />
                  </svg>
                )}
                <svg className="mark" viewBox="0 0 44 44" aria-hidden="true">
                  <rect className="mark-box" x="3" y="3" width="38" height="38" rx="9" />
                  <path className="mark-path mark-check" d="M12 23l7 7 14-16" />
                  <path className="mark-path mark-x" d="M13 13l18 18M31 13L13 31" />
                </svg>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {modal && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            {modal === "choose" && (
              <>
                <h3 id="modal-title">¿Cuántos bits para cerrarlo con broche de oro esta noche?</h3>
                <div className="bit-options">
                  {bitOptions.map((o, i) => (
                    <button type="button" className="btn bit-btn" key={o} autoFocus={i === 0} onClick={() => chooseBits(o)}>
                      {o}
                    </button>
                  ))}
                </div>
              </>
            )}
            {modal === "loading" && (
              <div className="loading" role="status">
                <div className="spinner" aria-hidden="true" />
                <h3 id="modal-title" className="loading-msg">{LOADING_MESSAGES[0]}</h3>
                <div className="loading-bar" aria-hidden="true"><div className="loading-bar-fill" /></div>
              </div>
            )}
            {modal === "message" && (
              <>
                <h3 id="modal-title">¡Listo! {bits ? `Elegiste ${bits}.` : ""}</h3>
                <p>Mira el chat del stream y, cuando lo veas, presiona el botón Aceptar.</p>
                <button type="button" className="btn" autoFocus onClick={accept}>
                  Aceptar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
