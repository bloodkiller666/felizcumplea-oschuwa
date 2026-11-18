"use client";

import { sfx } from "@/lib/sfx";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { burst } from "@/lib/fx";
import { gifts, giftFinalLabel, donationQuestion, donationOptions, kofiUrl } from "@/lib/content";
import { stranger, chat, chatNames, farewell, type ChatKind, type Donation } from "@/lib/room";
import Cake from "./Cake";

/*
  El final de la PC (capítulo 2): regalos del desconocido → chat del stream → pastel → despedida (y "Apagar PC").
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

/* ───────── 2 · El stream (simulación de Twitch): cámara y donaciones a la izquierda, chat a la derecha ───────── */
const rnd = (n: number) => 1 + Math.floor(Math.random() * n);

/** "Pankoki#37", "MotoPapu#8", "PankokiMod"… (el número se sortea cada vez). */
const nameOf = (k: ChatKind) => (chatNames[k].numbered ? `${chatNames[k].base}#${rnd(99)}` : chatNames[k].base);

function Badge({ kind }: { kind: ChatKind }) {
  if (kind === "mod")
    return (
      <svg className="tw-badge" viewBox="0 0 18 18" aria-label="Moderador"><rect width="18" height="18" rx="3" fill="#00ad03" /><path d="M6 12.5 12.5 6M10.5 5.5l2 2M5.5 10.5l2 2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" /></svg>
    );
  if (kind === "vip")
    return (
      <svg className="tw-badge" viewBox="0 0 18 18" aria-label="VIP"><rect width="18" height="18" rx="3" fill="#e005b9" /><path d="M9 3.5 14 8l-5 6.5L4 8Z" fill="#fff" /></svg>
    );
  if (kind === "sub")
    return (
      <svg className="tw-badge" viewBox="0 0 18 18" aria-label="Suscriptor"><rect width="18" height="18" rx="3" fill="#9146ff" /><path d="m9 3.4 1.7 3.7 4 .4-3 2.7.9 3.9L9 12 5.4 14.1l.9-3.9-3-2.7 4-.4Z" fill="#fff" /></svg>
    );
  return null;
}

const Gem = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2 17 8l-7 10L3 8Z" fill="#9146ff" /><path d="M3 8h14M7 8l3-6 3 6-3 10Z" stroke="#e3d4ff" strokeWidth="1.2" fill="none" strokeLinejoin="round" /></svg>
);
const Star = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m10 2 2.4 5.2 5.6.6-4.2 3.8 1.2 5.6L10 14.4 5 17.2l1.2-5.6L2 7.8l5.6-.6Z" fill="#b48cff" /></svg>
);
const Cup = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 7h11v5a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" fill="#29abe0" /><path d="M14 8h1.5a2.5 2.5 0 0 1 0 5H14" fill="none" stroke="#29abe0" strokeWidth="1.8" /><path d="M6 3v2M9 3v2M12 3v2" stroke="#9ad9f5" strokeWidth="1.4" strokeLinecap="round" /></svg>
);

type DonEvent = Donation & { user: string; id: number };
const donationText = (d: DonEvent) =>
  d.type === "bits"
    ? `donó ${d.amount.toLocaleString("es")} bits`
    : d.type === "kofi"
      ? `te invitó un café en Ko-fi · $${d.amount}`
      : d.gift
        ? `regaló ${d.gift} suscripciones`
        : `se suscribió (Nivel ${d.tier}) · ${d.months} meses`;
const DonIcon = ({ d }: { d: Donation }) => (d.type === "bits" ? <Gem /> : d.type === "kofi" ? <Cup /> : <Star />);

/* Una cámara de streamer dibujada: cuarto con neón, ella con audífonos y un micrófono. Parpadea de vez en cuando. */
function CamArt() {
  return (
    <svg className="tw-art" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="tw-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2b1740" /><stop offset="1" stopColor="#6a3f8c" /></linearGradient>
      </defs>
      <rect width="320" height="180" fill="url(#tw-bg)" />
      <g opacity="0.35" stroke="#ff7aa8" strokeWidth="1.4" fill="none"><circle cx="24" cy="26" r="6" /><path d="M300 20l6 10h-12Z" /><path d="M70 150l8 8M78 150l-8 8" /><circle cx="290" cy="118" r="6" /></g>
      <path d="M205 40c-8 0-14 6-14 14 0 10 8 16 18 16 5 0 8-3 10-8h30c2 5 5 8 10 8 10 0 18-6 18-16 0-8-6-14-14-14Z" fill="none" stroke="#ffd2ea" strokeWidth="3" strokeLinejoin="round" opacity="0.9" />
      <text x="26" y="48" fontFamily="var(--font-hand-stack)" fontSize="22" fontWeight="700" fill="#ffe3f0" opacity="0.9">Shake Gang</text>
      <rect x="0" y="150" width="320" height="30" fill="#1d1124" />
      <rect x="40" y="148" width="130" height="5" rx="2" fill="#3b2a45" />
      <ellipse cx="160" cy="176" rx="82" ry="20" fill="#3a2a5c" />
      <path d="M96 178c4-34 28-50 64-50s60 16 64 50Z" fill="#ff7aa8" />
      <rect x="148" y="110" width="24" height="22" rx="8" fill="#f2c4a8" />
      <path d="M104 86c0-30 22-48 56-48s56 18 56 48c0 6-1 12-3 16-12-26-30-34-53-34s-41 8-53 34c-2-4-3-10-3-16Z" fill="#2a1a3a" />
      <ellipse cx="160" cy="96" rx="46" ry="48" fill="#f7d3bd" />
      <path d="M112 78c10-24 30-32 48-32s38 8 48 32c-14-12-30-18-48-18s-34 6-48 18Z" fill="#2a1a3a" />
      <g className="tw-eyes"><ellipse cx="143" cy="98" rx="4.5" ry="6" fill="#2a1329" /><ellipse cx="177" cy="98" rx="4.5" ry="6" fill="#2a1329" /><circle cx="141.5" cy="95.5" r="1.6" fill="#fff" /><circle cx="175.5" cy="95.5" r="1.6" fill="#fff" /></g>
      <circle cx="132" cy="112" r="7" fill="#ff9fbf" opacity="0.5" /><circle cx="188" cy="112" r="7" fill="#ff9fbf" opacity="0.5" />
      <path d="M150 116q10 9 20 0" stroke="#7a3d5c" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M108 100V84a52 52 0 0 1 104 0v16" fill="none" stroke="#3a2a5c" strokeWidth="7" strokeLinecap="round" />
      <rect x="98" y="92" width="18" height="30" rx="8" fill="#ffb86b" /><rect x="204" y="92" width="18" height="30" rx="8" fill="#ffb86b" />
      <path d="M104 118q6 22 40 24" fill="none" stroke="#3a2a5c" strokeWidth="3" strokeLinecap="round" />
      <circle cx="146" cy="142" r="6" fill="#1d1124" />
    </svg>
  );
}

export function ChatWindow({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(0);
  const [alertEv, setAlertEv] = useState<DonEvent | null>(null);
  const [events, setEvents] = useState<DonEvent[]>([]);
  const [viewers, setViewers] = useState(1243);
  const done = useRef(onDone);
  done.current = onDone;
  // Los nombres (y sus números) se sortean una sola vez, al abrir el stream.
  const names = useRef<string[]>(chat.map((m) => nameOf(m.kind)));
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const quick = prefersReducedMotion();
    const id = window.setInterval(() => {
      sfx.pop();
      setN((v) => Math.min(chat.length, v + 1));
    }, quick ? 250 : 1700);
    return () => clearInterval(id);
  }, []);

  // Cada mensaje con donación la anuncia en la cámara y la suma al panel.
  useEffect(() => {
    if (n < 1 || n > chat.length) return;
    const d = chat[n - 1].donation;
    setViewers((v) => v + rnd(30) - 6);
    if (!d) return;
    const ev: DonEvent = { ...d, user: names.current[n - 1], id: n };
    sfx.ding();
    setAlertEv(ev);
    setEvents((list) => [ev, ...list]);
    const t = window.setTimeout(() => setAlertEv(null), prefersReducedMotion() ? 900 : 2600);
    return () => clearTimeout(t);
  }, [n]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [n]);

  useEffect(() => {
    if (n < chat.length) return;
    const t = window.setTimeout(() => done.current(), 3200);
    return () => clearTimeout(t);
  }, [n]);

  const totals = events.reduce(
    (a, e) => ({
      bits: a.bits + (e.type === "bits" ? e.amount : 0),
      subs: a.subs + (e.type === "sub" ? e.gift ?? 1 : 0),
      kofi: a.kofi + (e.type === "kofi" ? e.amount : 0),
    }),
    { bits: 0, subs: 0, kofi: 0 }
  );

  return (
    <div className="tw">
      <section className="tw-left">
        <div className="tw-cam" aria-label="Cámara del stream">
          <CamArt />
          <div className="tw-cam-top">
            <span className="tw-live">EN VIVO</span>
            <span className="tw-viewers"><i aria-hidden="true" />{viewers.toLocaleString("es")}</span>
          </div>
          <div className="tw-cam-bot">
            <b>ShuraHiwa</b>
            <span>Stream de cumpleaños · Just Chatting</span>
          </div>
          {alertEv && (
            <div className="tw-alert" key={alertEv.id} role="status">
              <span className={`tw-alert-ic ev-${alertEv.type}`}><DonIcon d={alertEv} /></span>
              <span><b>{alertEv.user}</b> {donationText(alertEv)}</span>
            </div>
          )}
        </div>

        <div className="tw-don">
          <header className="tw-don-head">
            <b>Donaciones y suscripciones</b>
            <span className="tw-chips">
              <span className="ev-bits"><Gem />{totals.bits.toLocaleString("es")}</span>
              <span className="ev-sub"><Star />{totals.subs}</span>
              <span className="ev-kofi"><Cup />${totals.kofi}</span>
            </span>
          </header>
          <ul className="tw-don-list" aria-live="polite" aria-label="Donaciones">
            {events.length === 0 && <li className="tw-don-empty">Esperando la primera donación…</li>}
            {events.map((e) => (
              <li key={e.id} className={`tw-ev ev-${e.type}`}>
                <span className="tw-ev-ic"><DonIcon d={e} /></span>
                <span className="tw-ev-tx"><b>{e.user}</b> {donationText(e)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="tw-chat" aria-label="Chat del stream">
        <header className="tw-chat-head">CHAT DE LA TRANSMISIÓN</header>
        <ol className="tw-list" ref={listRef} aria-live="polite">
          {chat.slice(0, n).map((m, i) => (
            <li key={i} className="tw-msg">
              <Badge kind={m.kind} />
              <b style={{ color: chatNames[m.kind].color }}>{names.current[i]}</b>
              <span className="tw-colon">:</span>
              <span className="tw-text">{m.text}</span>
            </li>
          ))}
        </ol>
        <div className="tw-input" aria-hidden="true">
          <span>Envía un mensaje</span>
          <i>Chat</i>
        </div>
      </section>
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
      gsap.set(".candles", { autoAlpha: 0 });
      return void gsap.delayedCall(1, onDone);
    }
    busy.current = true;
    gsap
      .timeline()
      .set(".knife", { y: -40, autoAlpha: 1, transformOrigin: "50% 0%" })
      .to(".knife", { y: 8, duration: 0.55, ease: "power3.in" })
      // las velitas se van apagando y desvaneciendo al paso del cuchillo (del centro hacia afuera)
      .to(".candle", { autoAlpha: 0, y: 16, scale: 0.6, transformOrigin: "50% 100%", duration: 0.3, stagger: { each: 0.07, from: "center" }, ease: "power2.in" }, "<0.18")
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
