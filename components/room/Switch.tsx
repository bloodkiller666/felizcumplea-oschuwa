"use client";

import { sfx } from "@/lib/sfx";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { burst } from "@/lib/fx";
import { bake } from "@/lib/room";

type Phase = "off" | "boot" | "home" | "play" | "done";

/*
  La Nintendo Switch: "Pastelería Shake". Se hornea el postre en cuatro pasos:
  ingredientes → mezclar (girando el dedo) → hornear (sacarlo en el punto dorado) → decorar.
  Todo se dimensiona con unidades de contenedor, así que sirve igual en la Switch horizontal y en la vertical del móvil.
*/
const lerpColor = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(",")})`;
};

function BakeCake({ baked, top, batter = 1 }: { baked: number; top: boolean[]; batter?: number }) {
  const body = lerpColor("#f4e3c4", "#d9954f", baked);
  const side = lerpColor("#ead3ad", "#c07f3a", baked);
  return (
    <svg className="bk-cake" viewBox="0 0 200 170" aria-hidden="true">
      <ellipse cx="100" cy="150" rx="86" ry="12" fill="#fff1df" />
      <ellipse cx="100" cy="147" rx="76" ry="8" fill="#f2d9bd" />
      <g style={{ transform: `scaleY(${0.35 + 0.65 * batter})`, transformOrigin: "100px 140px" }}>
        <rect x="38" y="78" width="124" height="62" rx="12" fill={body} />
        <rect x="38" y="118" width="124" height="22" rx="10" fill={side} />
        {top[0] && <path d="M38 88 q8 14 16 0 q8 18 16 0 q8 12 16 0 q8 16 16 0 q8 12 16 0 q8 18 16 0 q8 12 16 0 q4 10 8 0 v-14 h-124Z" fill="#fff1df" />}
        {top[0] && <rect x="38" y="76" width="124" height="14" rx="7" fill="#fff1df" />}
      </g>
      {top[1] && (
        <g>
          {[62, 90, 118, 142].map((x, i) => (
            <g key={x} transform={`translate(${x} ${i % 2 ? 72 : 76})`}>
              <path d="M0 0 q-9 2 -7 12 q4 8 7 8 q3 0 7 -8 q2 -10 -7 -12Z" fill="#e5484d" />
              <path d="M-4 -1 q4 -5 4 -5 q0 0 4 5Z" fill="#3dbb7d" />
            </g>
          ))}
        </g>
      )}
      {top[2] && (
        <g>
          {Array.from({ length: 16 }, (_, i) => (
            <rect key={i} x={46 + ((i * 37) % 108)} y={96 + ((i * 53) % 34)} width="5" height="2.4" rx="1" fill={["#ff7aa8", "#7c93ff", "#ffb86b", "#7dffb0"][i % 4]} transform={`rotate(${(i * 47) % 90} ${46 + ((i * 37) % 108)} ${96 + ((i * 53) % 34)})`} />
          ))}
        </g>
      )}
      {top[3] && (
        <g>
          {[80, 100, 120].map((x, i) => (
            <g key={x}>
              <rect x={x - 2.5} y="44" width="5" height="28" rx="2" fill={i % 2 ? "#7c93ff" : "#ffb86b"} />
              <ellipse className="bk-flame" cx={x} cy="38" rx="4.6" ry="7.6" fill="#ffb86b" style={{ animationDelay: `${i * -0.3}s` }} />
              <ellipse cx={x} cy="40" rx="2.2" ry="4.4" fill="#fff6d8" />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}

export default function Switch({ onExit }: { onExit: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("off");
  const [step, setStep] = useState(1);
  const [added, setAdded] = useState<boolean[]>([false, false, false]);
  const [stirred, setStirred] = useState(0);
  const [baked, setBaked] = useState<"idle" | "baking" | "done">("idle");
  const [bakeNote, setBakeNote] = useState<string>(bake.step3.hint);
  const [top, setTop] = useState<boolean[]>([false, false, false, false]);
  const { contextSafe } = useGSAP({ scope: root });

  const stir = useRef({ on: false, last: 0, acc: 0 });
  const spoonPhase = useRef({ v: 0 });
  const bakeTween = useRef<gsap.core.Tween | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [clock, setClock] = useState("--:--");
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit", hour12: false }));
    tick();
    const id = window.setInterval(tick, 20000);
    return () => window.clearInterval(id);
  }, []);
  const batter = added.filter(Boolean).length / 3;

  const power = contextSafe(() => {
    sfx.switchBoot();
    setPhase("boot");
    if (prefersReducedMotion()) return setPhase("home");
    // Pantalla negra; los dos Joy-Con (azul y rojo) entran desde los lados, se juntan con un clic y aparece el nombre.
    gsap
      .timeline({ onComplete: () => setPhase("home") })
      .fromTo(".nsw-boot", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: "none" })
      .fromTo(".sw-jc-l", { xPercent: -260, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out" }, 0.25)
      .fromTo(".sw-jc-r", { xPercent: 260, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out" }, 0.25)
      .fromTo(".sw-mark", { scale: 1 }, { scale: 1.07, duration: 0.14, yoyo: true, repeat: 1, ease: "power2.out" }, 0.9)
      .fromTo(".nsw-boot strong", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out" }, 1.15)
      .to(".nsw-boot", { autoAlpha: 0, duration: 0.4, ease: "none" }, 3.1);
  });

  useGSAP(
    () => {
      if (phase === "home") gsap.from(".nsw-tile", { autoAlpha: 0, y: 24, stagger: 0.1, duration: 0.6, ease: "power3.out" });
      if (phase === "done") {
        sfx.win();
        gsap.from(".bk-done > *", { autoAlpha: 0, y: 14, stagger: 0.12, duration: 0.6, ease: "power3.out", delay: 0.2 });
        const host = root.current?.querySelector<HTMLElement>(".nsw-screen");
        if (host) burst(host, host.clientWidth / 2, host.clientHeight * 0.4, { count: 36, shape: "confetti", distance: 200, colors: ["#ffb86b", "#ff7aa8", "#7c93ff", "#fff1df"] });
      }
    },
    { dependencies: [phase], scope: root }
  );

  useGSAP(
    () => {
      if (phase !== "play") return;
      gsap.from(".bk-stage > *", { autoAlpha: 0, y: 16, stagger: 0.08, duration: 0.5, ease: "power3.out" });
    },
    { dependencies: [phase, step], scope: root }
  );

  // 1 · Ingredientes
  const addIngredient = contextSafe((i: number) => {
    if (added[i]) return;
    sfx.pop();
    const next = added.map((v, k) => (k === i ? true : v));
    setAdded(next);
    gsap.fromTo(`.bk-chip-fly-${i}`, { y: -120, autoAlpha: 1, scale: 1 }, { y: 20, autoAlpha: 0, scale: 0.6, duration: 0.7, ease: "power2.in" });
    gsap.fromTo(".bk-bowl", { scale: 1 }, { scale: 1.05, duration: 0.15, yoyo: true, repeat: 1, delay: 0.55 });
    if (next.every(Boolean)) gsap.delayedCall(1, () => setStep(2));
  });

  // 2 · Mezclar: gira alrededor del centro del tazón; tres vueltas completas.
  const stirDown = (e: RPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    stir.current = { on: true, last: Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)), acc: stir.current.acc };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const stirMove = contextSafe((e: RPointerEvent<HTMLDivElement>) => {
    const s = stir.current;
    if (!s.on) return;
    const r = e.currentTarget.getBoundingClientRect();
    const a = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
    let d = a - s.last;
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    s.last = a;
    spoonPhase.current.v += d;
    moveSpoon();
    s.acc += Math.abs(d);
    bumpStir(Math.min(1, s.acc / (Math.PI * 6)));
  });
  // La cuchara está de lado, así que "dar vueltas" se ve como un sube y baja sobre su mismo eje (con un balanceo leve).
  const moveSpoon = () => {
    const v = spoonPhase.current.v;
    gsap.set(".bk-spoon", { yPercent: Math.sin(v) * 9, xPercent: Math.cos(v) * 22, rotation: Math.cos(v) * 6 });
  };
  const bumpStir = (v: number) => {
    setStirred((p) => {
      const n = Math.max(p, v);
      if (n >= 1 && p < 1) {
        sfx.success();
        gsap.delayedCall(0.6, () => setStep(3));
      }
      return n;
    });
  };
  const stirClick = contextSafe(() => {
    stir.current.acc += Math.PI * 0.8;
    gsap.to(spoonPhase.current, { v: "+=" + Math.PI * 2, duration: 0.6, ease: "power2.out", onUpdate: moveSpoon });
    bumpStir(Math.min(1, stir.current.acc / (Math.PI * 6)));
  });

  // 3 · Hornear: la barra sube; hay que sacarlo entre 55 % y 90 %.
  const startBake = contextSafe(() => {
    sfx.tick();
    setBaked("baking");
    setBakeNote("¡Mira el horno! Saca el pastel cuando la barra esté en el dorado.");
    bakeTween.current?.kill();
    bakeTween.current = gsap.fromTo(
      bar.current,
      { "--p": 0 },
      {
        "--p": 1,
        duration: 6,
        ease: "none",
        onComplete: () => {
          sfx.error();
          setBakeNote(bake.burnt);
          setBaked("idle");
          gsap.set(bar.current, { "--p": 0 });
        },
      }
    );
  });
  const takeOut = contextSafe(() => {
    const p = Number(gsap.getProperty(bar.current, "--p")) || 0;
    bakeTween.current?.kill();
    if (p < 0.55) {
      sfx.error();
      setBakeNote(bake.raw);
      setBaked("idle");
      gsap.set(bar.current, { "--p": 0 });
      return;
    }
    if (p > 0.9) {
      sfx.error();
          setBakeNote(bake.burnt);
      setBaked("idle");
      gsap.set(bar.current, { "--p": 0 });
      return;
    }
    sfx.success();
    setBakeNote(bake.perfect);
    setBaked("done");
    const host = root.current?.querySelector<HTMLElement>(".nsw-screen");
    if (host) burst(host, host.clientWidth / 2, host.clientHeight / 2, { count: 20, shape: "star", distance: 140, colors: ["#ffb86b", "#fff1df"] });
    gsap.delayedCall(1.4, () => setStep(4));
  });

  // 4 · Decorar
  const decorate = contextSafe((i: number) => {
    if (top[i]) return;
    sfx.pop();
    const next = top.map((v, k) => (k === i ? true : v));
    setTop(next);
    gsap.fromTo(".bk-cake", { scale: 1 }, { scale: 1.04, duration: 0.15, yoyo: true, repeat: 1 });
    if (next.every(Boolean)) gsap.delayedCall(1.1, () => setPhase("done"));
  });

  const spoon = (
    <svg className="bk-spoon" viewBox="0 0 40 150" aria-hidden="true">
      <rect x="16" y="0" width="8" height="104" rx="4" fill="#a8642f" />
      <rect x="18" y="5" width="2.5" height="94" rx="1.2" fill="#c98a4f" />
      <ellipse cx="20" cy="118" rx="17" ry="27" fill="#c98a4f" />
      <ellipse cx="20" cy="118" rx="12" ry="21" fill="#b9763c" />
    </svg>
  );

  return (
    <div className="nsw" data-focus ref={root}>
      <i className="joy joy-l" aria-hidden="true" />
      <div className="nsw-screen" data-nofx>
        {phase === "off" && (
          <div className="dv-off">
            <button type="button" className="btn" onClick={power}>
              Encender
            </button>
          </div>
        )}

        {phase === "boot" && (
          <div className="nsw-boot" aria-hidden="true">
            <div className="sw-mark">
              <i className="sw-jc sw-jc-l"><b /></i>
              <i className="sw-jc sw-jc-r"><b /></i>
            </div>
            <strong>{bake.logo}</strong>
          </div>
        )}

        {phase === "home" && (
          <div className="nsw-home">
            <header>
              <span>{clock}</span>
              <span className="nsw-batt" aria-hidden="true" />
            </header>
            <ul className="nsw-tiles">
              <li>
                <button type="button" className="nsw-tile nsw-tile-main" onClick={() => setPhase("play")}>
                  <span className="nsw-art" aria-hidden="true" />
                  <b>{bake.game}</b>
                  <small>Toca para jugar</small>
                </button>
              </li>
              {[0, 1, 2].map((i) => (
                <li key={i}>
                  <span className={`nsw-tile nsw-tile-dim nsw-dim-${i}`} aria-hidden="true" />
                </li>
              ))}
            </ul>
          </div>
        )}

        {phase === "play" && (
          <div className="bk">
            <header className="bk-head">
              <h3>{[bake.step1, bake.step2, bake.step3, bake.step4][step - 1].title}</h3>
              <p aria-live="polite">{step === 3 ? bakeNote : [bake.step1, bake.step2, bake.step3, bake.step4][step - 1].hint}</p>
            </header>

            <div className="bk-stage">
              {step === 1 && (
                <>
                  <div className="bk-bowl" aria-hidden="true">
                    <i className="bk-fill" style={{ "--v": batter } as CSSProperties} />
                    {[0, 1, 2].map((i) => (
                      <i key={i} className={`bk-chip bk-chip-fly-${i}`} />
                    ))}
                  </div>
                  <div className="bk-row">
                    {bake.ingredients.map((n, i) => (
                      <button type="button" className={`bk-btn${added[i] ? " is-done" : ""}`} key={n} onClick={() => addIngredient(i)} disabled={added[i]}>
                        {n}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {step === 2 && (
                <div className="bk-stirwrap">
                  {spoon}
                <div
                  className="bk-bowl bk-bowl-stir"
                  role="button"
                  tabIndex={0}
                  aria-label="Mezclar: gira el dedo sobre el tazón o pulsa Enter"
                  onPointerDown={stirDown}
                  onPointerMove={stirMove}
                  onPointerUp={() => (stir.current.on = false)}
                  onPointerCancel={() => (stir.current.on = false)}
                  onClick={stirClick}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), stirClick())}
                >
                  <i className="bk-fill" style={{ "--v": 1 } as CSSProperties} />
                  <span className="bk-prog" style={{ "--p": stirred } as CSSProperties} aria-hidden="true" />
                </div>
                </div>
              )}

              {step === 3 && (
                <>
                  <div className={`bk-oven${baked === "baking" ? " is-on" : ""}`} aria-hidden="true">
                    <div className="bk-oven-win">
                      <BakeCake baked={baked === "done" ? 0.8 : 0} top={[false, false, false, false]} batter={baked === "idle" ? 0.35 : 1} />
                    </div>
                  </div>
                  <div className="bk-meter" ref={bar} style={{ "--p": 0 } as CSSProperties} aria-hidden="true">
                    <i className="bk-zone" />
                    <i className="bk-needle" />
                  </div>
                  <div className="bk-row">
                    {baked === "idle" && (
                      <button type="button" className="bk-btn" onClick={startBake}>
                        Meter al horno
                      </button>
                    )}
                    {baked === "baking" && (
                      <button type="button" className="bk-btn bk-btn-go" onClick={takeOut}>
                        ¡Sacar!
                      </button>
                    )}
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  <BakeCake baked={0.8} top={top} />
                  <div className="bk-row">
                    {bake.toppings.map((n, i) => (
                      <button type="button" className={`bk-btn${top[i] ? " is-done" : ""}`} key={n} onClick={() => decorate(i)} disabled={top[i]}>
                        {n}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <ol className="bk-dots" aria-hidden="true">
              {[1, 2, 3, 4].map((n) => (
                <li key={n} className={n < step ? "is-done" : n === step ? "is-now" : ""} />
              ))}
            </ol>
          </div>
        )}

        {phase === "done" && (
          <div className="bk bk-done">
            <h3>{bake.done}</h3>
            <BakeCake baked={0.8} top={[true, true, true, true]} />
            <p>{bake.doneText}</p>
            <button type="button" className="btn btn-go" onClick={onExit} data-nofx>
              {bake.exit}
            </button>
          </div>
        )}
      </div>
      <i className="joy joy-r" aria-hidden="true" />
    </div>
  );
}
