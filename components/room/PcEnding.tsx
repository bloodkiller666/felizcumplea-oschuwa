"use client";

import { sfx } from "@/lib/sfx";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { burst, confettiRain } from "@/lib/fx";
import { gifts, giftFinalLabel, donationQuestion, donationOptions, kofiUrl } from "@/lib/content";
import { stranger, chat, farewell, credits, save } from "@/lib/room";
import Cake from "./Cake";

/*
  El final de la PC (capítulo 2): regalos del desconocido → chat del stream → pastel → despedida → créditos → guardado.
  Cada pieza avisa con un callback cuando termina; PcStation las encadena.
*/

type Third = "locked" | "x" | "done";
type ModalPhase = null | "choose" | "loading" | "message";
const LOADING = ["Conectando con Ko-fi…", "Verificando tu apoyo…", "Preparando el broche de oro…"];

/* ───────── 1 · Los tres regalos y la pregunta ───────── */
export function GiftsWindow({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const [marks, setMarks] = useState<boolean[]>([false, false]);
  const [third, setThird] = useState<Third>("locked");
  const [label3, setLabel3] = useState(gifts[2]);
  const [modal, setModal] = useState<ModalPhase>(null);
  const [bits, setBits] = useState<string | null>(null);
  const { contextSafe } = useGSAP({ scope: root });
  const row = (i: number) => root.current?.querySelector<HTMLElement>(`[data-gift="${i}"]`) ?? null;

  useGSAP(
    () => {
      gsap.set(".gf-path", { drawSVG: "0%" });
      gsap.from(".gf-intro > *", { autoAlpha: 0, y: 10, stagger: 0.25, duration: 0.6, delay: 0.2 });
      gsap.from(".gf-row", { autoAlpha: 0, x: -40, stagger: 0.14, duration: 0.7, ease: "expo.out", delay: 1 });
    },
    { scope: root }
  );

  useGSAP(
    () => {
      if (!modal) return;
      const q = gsap.utils.selector(root);
      gsap.fromTo(q(".gf-card"), { scale: 0.85, y: 20, autoAlpha: 0 }, { scale: 1, y: 0, autoAlpha: 1, duration: 0.45, ease: "back.out(1.7)" });
      if (modal === "choose") {
        gsap.fromTo(q(".gf-back"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
        gsap.from(q(".gf-bit"), { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.45, delay: 0.25, ease: "back.out(1.7)" });
      }
      if (modal === "loading") {
        gsap.to(q(".gf-spin"), { rotation: 360, duration: 0.9, repeat: -1, ease: "none" });
        gsap.fromTo(q(".gf-bar i"), { scaleX: 0 }, { scaleX: 1, duration: 3.3, ease: "power1.inOut" });
        const msg = q(".gf-load-msg")[0];
        if (msg) {
          const tl = gsap.timeline();
          LOADING.forEach((t, i) => tl.call(() => { msg.textContent = t; }, undefined, i * 1.1));
        }
      }
    },
    { dependencies: [modal], scope: root }
  );

  const failThird = contextSafe(() => {
    const r = row(2);
    if (!r) return;
    sfx.error();
    setThird("x");
    gsap
      .timeline()
      .fromTo(r, { x: 0 }, { x: "random(-7,7)", duration: 0.06, repeat: 11, repeatRefresh: true, ease: "none" })
      .to(r, { x: 0, duration: 0.08 })
      .fromTo(r.querySelector(".gf-x"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.55, ease: "power3.out" })
      .add(() => setModal("choose"), "+=1.1");
  });

  const markGift = contextSafe((i: 0 | 1) => {
    if (marks[i] || third !== "locked") return;
    const r = row(i);
    const next = marks.map((m, k) => (k === i ? true : m));
    sfx.success();
    setMarks(next);
    if (r) {
      gsap.fromTo(r.querySelector(".gf-check"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.55, ease: "power2.out" });
      gsap.fromTo(r, { scale: 1 }, { scale: 1.03, duration: 0.16, yoyo: true, repeat: 1 });
      burst(r, r.clientWidth - 30, r.clientHeight / 2, { count: 14, shape: "star", colors: ["#1faa6b", "#ff7aa8", "#FFFFFF"], distance: 80 });
    }
    if (next[0] && next[1]) gsap.delayedCall(1.1, failThird);
  });

  const chooseBits = contextSafe((option: string) => {
    sfx.click();
    setBits(option);
    setModal("loading");
    gsap.delayedCall(3.4, () => setModal("message"));
  });

  const finish = contextSafe(() => {
    const r = row(2);
    if (!r) return;
    sfx.success();
    setThird("done");
    gsap.to(r.querySelector(".gf-x"), { autoAlpha: 0, duration: 0.3 });
    gsap.to(r.querySelector(".gf-label"), {
      duration: 1.6,
      scrambleText: { text: giftFinalLabel, chars: "upperAndLowerCase", revealDelay: 0.4, speed: 0.6 },
      onComplete: () => setLabel3(giftFinalLabel),
    });
    gsap.fromTo(r.querySelector(".gf-check"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.7, delay: 0.9, ease: "power2.out" });
    burst(r, r.clientWidth - 30, r.clientHeight / 2, { count: 32, shape: "star", distance: 160, delay: 1 });
    gsap.delayedCall(3.6, onDone);
  });

  const accept = contextSafe(() => {
    gsap.to(".gf-back", { autoAlpha: 0, duration: 0.35, onComplete: () => { setModal(null); finish(); } });
  });

  const stateOf = (i: number) => (i < 2 ? (marks[i] ? "is-checked" : "") : third === "x" ? "is-failed" : third === "done" ? "is-checked" : "is-locked");
  const noteOf = (i: number) => (i < 2 ? (marks[i] ? "Recibido" : "Toca para marcar") : third === "x" ? "No recibido" : third === "done" ? "¡Recibido!" : "Bloqueado");

  return (
    <div className="gf" ref={root}>
      <div className="gf-intro">
        <p className="gf-from">
          De: <b>{stranger.from}</b> <span>&lt;{stranger.addr}&gt;</span>
        </p>
        <h3>{stranger.subject}</h3>
        <p>{stranger.body}</p>
      </div>

      <ul className="gf-list">
        {gifts.map((g, i) => (
          <li key={g}>
            <button type="button" className={`gf-row ${stateOf(i)}`} data-gift={i} data-nofx disabled={i === 2 || marks[i as 0 | 1]} onClick={() => i < 2 && markGift(i as 0 | 1)} aria-label={`${i === 2 ? label3 : g}: ${noteOf(i)}`}>
              <span className="gf-num" aria-hidden="true">{i + 1}</span>
              <span className="gf-body">
                <span className="gf-label">{i === 2 ? label3 : g}</span>
                <span className="gf-note">{noteOf(i)}</span>
              </span>
              <svg className="gf-mark" viewBox="0 0 44 44" aria-hidden="true">
                <rect x="3" y="3" width="38" height="38" rx="9" fill="none" />
                <path className="gf-path gf-check" d="M12 23l7 7 14-16" />
                <path className="gf-path gf-x" d="M13 13l18 18M31 13L13 31" />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      {modal && (
        <div className="gf-back" role="presentation">
          <div className="gf-card" role="dialog" aria-modal="true" aria-labelledby="gf-title">
            {modal === "choose" && (
              <>
                <h3 id="gf-title">{donationQuestion}</h3>
                <div className="gf-bits">
                  {donationOptions.map((o, i) => (
                    <button type="button" className="btn btn-go gf-bit" key={o} autoFocus={i === 0} onClick={() => chooseBits(o)} data-nofx>
                      {o}
                    </button>
                  ))}
                </div>
              </>
            )}
            {modal === "loading" && (
              <div className="gf-loading" role="status">
                <div className="gf-spin" aria-hidden="true" />
                <h3 id="gf-title" className="gf-load-msg">{LOADING[0]}</h3>
                <div className="gf-bar" aria-hidden="true"><i /></div>
              </div>
            )}
            {modal === "message" && (
              <>
                <h3 id="gf-title">¡Listo! {bits ? `Elegiste ${bits}.` : ""}</h3>
                <p>
                  Hazlo por Ko-fi
                  {kofiUrl && (
                    <>
                      {" "}(<a href={kofiUrl} target="_blank" rel="noopener noreferrer">abrir Ko-fi</a>)
                    </>
                  )}
                  {" "}y, cuando te llegue la notificación, presiona el botón Aceptar.
                </p>
                <button type="button" className="btn btn-go" autoFocus onClick={accept} data-nofx>
                  Aceptar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────── 2 · El chat del stream ───────── */
export function ChatWindow({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(0);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const quick = prefersReducedMotion();
    const id = window.setInterval(() => {
      sfx.pop();
      setN((v) => Math.min(chat.length, v + 1));
    }, quick ? 250 : 1500);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (n < chat.length) return;
    const t = window.setTimeout(() => done.current(), 2200);
    return () => clearTimeout(t);
  }, [n]);

  return (
    <div className="ch">
      <header className="ch-head">
        <span className="ch-live"><i /> EN VIVO</span>
        <b>Stream de cumpleaños</b>
        <span className="ch-count">chat</span>
      </header>
      <ol className="ch-list" aria-live="polite" aria-label="Chat del stream">
        {chat.slice(0, n).map((m, i) => (
          <li key={i} className="ch-msg">
            <b className={`tone-${m.tone}`}>{m.user}</b>
            <span>{m.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ───────── 3 · El pastel: soplar las velitas y repartirlo ───────── */
type CakeStage = "lit" | "out" | "cut";
const CAKE_CAPTION: Record<CakeStage, string> = {
  lit: "Pide un deseo y toca el pastel para apagar las velitas",
  out: "Tus deseos ya van en el humo. Toca otra vez para partirlo",
  cut: "Una rebanada para cada quien…",
};

export function CakeWindow({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<CakeStage>("lit");
  const busy = useRef(false);
  const { contextSafe } = useGSAP({ scope: root });

  useGSAP(
    () => {
      gsap.from(".ck-stage", { y: 40, autoAlpha: 0, scale: 0.94, duration: 0.9, ease: "expo.out" });
      gsap.from(".ck-prompt", { autoAlpha: 0, y: 12, duration: 0.7, delay: 0.5 });
    },
    { scope: root }
  );

  const sparks = (colors: string[], count = 22) => {
    const r = root.current?.querySelector(".cake-svg")?.getBoundingClientRect();
    if (r) burst(document.body, r.left + r.width / 2, r.top + r.height * 0.3, { count, shape: "star", distance: 120, colors });
  };

  const blow = contextSafe(() => {
    sfx.blow();
    setStage("out");
    if (prefersReducedMotion()) return void gsap.set(".flame", { autoAlpha: 0 });
    busy.current = true;
    gsap
      .timeline()
      .to(".cake-svg", { rotation: -1.5, transformOrigin: "50% 100%", duration: 0.08, yoyo: true, repeat: 5, ease: "sine.inOut" })
      .to(".flame", { scale: 0.2, autoAlpha: 0, transformOrigin: "50% 100%", duration: 0.35, stagger: 0.07, ease: "power2.in" }, 0)
      .fromTo(".smoke", { autoAlpha: 0.7, y: 0 }, { autoAlpha: 0, y: -28, duration: 1.6, stagger: 0.07, ease: "power1.out" }, 0.25)
      .add(() => sparks(["#ffb86b", "#fff1df", "#ff7aa8"]), 0.2)
      .add(() => {
        busy.current = false;
      }, 0.9);
  });

  const cut = contextSafe(() => {
    sfx.cut();
    setStage("cut");
    if (prefersReducedMotion()) {
      gsap.set(".plate", { autoAlpha: 1 });
      gsap.set(".slice", { y: 56, scale: 0.8, transformOrigin: "50% 100%" });
      return void gsap.delayedCall(1, onDone);
    }
    busy.current = true;
    gsap
      .timeline()
      .set(".knife", { y: -40, autoAlpha: 1, transformOrigin: "50% 0%" })
      .to(".knife", { y: 8, duration: 0.55, ease: "power3.in" })
      .to(".knife", { autoAlpha: 0, y: -30, duration: 0.4, ease: "power2.out" })
      .to(".slice-a", { x: -10, duration: 0.4, ease: "power2.out" }, "<0.1")
      .to(".slice-c", { x: 10, duration: 0.4, ease: "power2.out" }, "<")
      .to(".cake-plate", { opacity: 0.25, duration: 0.5 }, "<0.2")
      .to(".plate", { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.12, ease: "back.out(1.6)" }, "<")
      .to(".slice", { x: (i: number) => [-24, 0, 24][i], y: 62, scaleX: 0.62, scaleY: 0.78, transformOrigin: "50% 100%", duration: 0.9, stagger: 0.18, ease: "power3.inOut" }, "-=0.2")
      .add(() => sparks(["#ff7aa8", "#ffb86b", "#7c93ff", "#fff1df"], 30), "-=0.3")
      .to({}, { duration: 1.4 })
      .add(() => {
        busy.current = false;
        onDone();
      });
  });

  const tap = () => {
    if (busy.current) return;
    if (stage === "lit") blow();
    else if (stage === "out") cut();
  };

  return (
    <div className="ck" ref={root}>
      <p className="ck-prompt" aria-live="polite">{CAKE_CAPTION[stage]}</p>
      <div className="ck-stage" data-nofx>
        <button type="button" className={`cake-btn is-${stage}`} onClick={tap} disabled={stage === "cut"} aria-label={stage === "lit" ? "Apagar las velitas" : stage === "out" ? "Cortar el pastel" : "Repartiendo el pastel"} autoFocus>
          <Cake />
        </button>
      </div>
    </div>
  );
}

/* ───────── 4 · El mensaje de cumpleaños y despedida ───────── */
export function FarewellWindow({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const { contextSafe } = useGSAP({ scope: root });

  useGSAP(
    () => {
      const paras = gsap.utils.toArray<HTMLElement>(".fw-p", root.current);
      const scroller = root.current?.querySelector<HTMLElement>(".fw-scroll");
      const quick = prefersReducedMotion();
      const tl = gsap.timeline({ onComplete: () => setReady(true) });
      tl.from(".fw-title", { autoAlpha: 0, y: 14, duration: 0.9, ease: "power3.out" });
      paras.forEach((p) => {
        const read = Math.min(5.2, 1.2 + p.textContent!.length * 0.026);
        tl.from(p, { autoAlpha: quick ? 1 : 0, y: 12, duration: 0.8, ease: "power2.out", onStart: () => scroller?.scrollTo({ top: scroller.scrollHeight, behavior: quick ? "auto" : "smooth" }) }, quick ? "+=0" : `+=${read}`);
      });
      tl.from(".fw-sign", { autoAlpha: 0, duration: 1, onStart: () => scroller?.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" }) }, "+=1.6");
    },
    { scope: root }
  );

  useGSAP(
    () => {
      if (!ready) return;
      gsap.from(".fw-cta", { autoAlpha: 0, y: 10, duration: 0.7 });
    },
    { dependencies: [ready], scope: root }
  );

  const next = contextSafe(() => {
    sfx.click();
    onDone();
  });

  return (
    <div className="fw" ref={root}>
      <div className="fw-scroll">
        <h3 className="fw-title">{farewell.title}</h3>
        {farewell.body.map((p) => (
          <p className="fw-p" key={p}>
            {p}
          </p>
        ))}
        <p className="fw-sign">{farewell.sign}</p>
      </div>
      {ready && (
        <div className="fw-foot">
          <button type="button" className="btn btn-go fw-cta" onClick={next} data-nofx autoFocus>
            {farewell.cta}
          </button>
        </div>
      )}
    </div>
  );
}

/* ───────── 5 · Créditos del stream ───────── */
export function Credits({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const finished = useRef(false);
  const end = () => {
    if (finished.current) return;
    finished.current = true;
    onDone();
  };

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.delayedCall(3, end);
        return;
      }
      gsap.fromTo(".cr-roll", { yPercent: 100 }, { yPercent: -100, duration: 30, ease: "none", onComplete: end });
      confettiRain(60);
    },
    { scope: root }
  );

  return (
    <div className="cr" ref={root}>
      <div className="cr-roll">
        <h3>Créditos del stream</h3>
        {credits.map((c) => (
          <p key={c.role + c.name}>
            <small>{c.role}</small>
            <b>{c.name}</b>
          </p>
        ))}
        <h3 className="cr-end">Gracias por todo, jefa</h3>
      </div>
      <button type="button" className="btn btn-ghost cr-skip" onClick={end} data-nofx>
        Saltar
      </button>
    </div>
  );
}

/* ───────── 6 · Guardar partida ───────── */
export function SaveScreen({ onSaved }: { onSaved: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"ask" | "saving" | "saved">("ask");
  const { contextSafe } = useGSAP({ scope: root });

  useGSAP(
    () => {
      gsap.from(".sv-card", { autoAlpha: 0, y: 24, scale: 0.96, duration: 0.8, ease: "power3.out" });
    },
    { scope: root }
  );

  const doSave = contextSafe(() => {
    sfx.click();
    setState("saving");
    gsap.delayedCall(prefersReducedMotion() ? 0.2 : 1.6, () => {
      sfx.save();
      setState("saved");
      gsap.delayedCall(prefersReducedMotion() ? 0.5 : 3, onSaved);
    });
  });

  useGSAP(
    () => {
      if (state === "saved") gsap.from(".sv-saved > *", { autoAlpha: 0, y: 10, stagger: 0.2, duration: 0.6 });
      if (state === "saving") gsap.to(".sv-disk", { rotation: 360, duration: 1.2, repeat: -1, ease: "none" });
    },
    { dependencies: [state], scope: root }
  );

  return (
    <div className="sv" ref={root}>
      <div className="sv-card">
        {state !== "saved" ? (
          <>
            <h3>{save.title}</h3>
            <p className="sv-slot">{save.slot}</p>
            <ul>
              {save.stats.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <button type="button" className="btn btn-go" onClick={doSave} disabled={state === "saving"} data-nofx autoFocus>
              {state === "saving" ? <i className="sv-disk" aria-hidden="true" /> : null}
              {state === "saving" ? "Guardando…" : save.cta}
            </button>
          </>
        ) : (
          <div className="sv-saved" role="status">
            <h3>{save.saved}</h3>
            <button type="button" className="btn btn-ghost" disabled>
              {save.cont}
            </button>
            <p>{save.note}</p>
          </div>
        )}
      </div>
    </div>
  );
}
