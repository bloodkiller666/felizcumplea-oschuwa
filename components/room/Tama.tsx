"use client";

import { sfx } from "@/lib/sfx";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { burst } from "@/lib/fx";

/*
  El tamagochi de Motoperro (el beagle), dentro de su huevo. Cuatro necesidades que bajan con el tiempo y cuatro cuidados.
  Cuando Motoperro ha probado los cuatro (croquetas, paseo, caricias y siesta) se pone su gorro de fiesta y deja salir.
  Todo el dibujo es SVG + CSS: solo se animan transform y opacity.
*/
type Mode = "idle" | "eat" | "walk" | "pet" | "sleep";
type Care = "eat" | "walk" | "pet" | "sleep";
type Stats = { hunger: number; fun: number; energy: number; love: number };

const CARES: { key: Care; label: string; done: string }[] = [
  { key: "eat", label: "Croquetas", done: "comió" },
  { key: "walk", label: "Paseo", done: "paseó" },
  { key: "pet", label: "Caricias", done: "recibió mimos" },
  { key: "sleep", label: "Siesta", done: "durmió" },
];
const METERS: { key: keyof Stats; label: string; icon: Care }[] = [
  { key: "hunger", label: "Pancita", icon: "eat" },
  { key: "fun", label: "Diversión", icon: "walk" },
  { key: "love", label: "Cariño", icon: "pet" },
  { key: "energy", label: "Energía", icon: "sleep" },
];

const clamp = (n: number) => Math.max(0, Math.min(100, n));
const START: Stats = { hunger: 50, fun: 42, energy: 68, love: 38 };

function Icon({ name }: { name: Care }) {
  const p = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
  if (name === "eat")
    return (
      <svg {...p}>
        <path d="M5 11h14l-1.4 7a2 2 0 0 1-2 1.6H8.4a2 2 0 0 1-2-1.6L5 11Z" />
        <path d="M8 8l.8-1.6M12 7V5M16 8l-.8-1.6" />
      </svg>
    );
  if (name === "walk")
    return (
      <svg {...p}>
        <circle cx="6" cy="17" r="3" />
        <circle cx="18" cy="17" r="3" />
        <path d="M6 17l4-7h5l3 7M10 10l-1-3h-2M14 10l1-3h2" />
      </svg>
    );
  if (name === "pet")
    return (
      <svg {...p}>
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.4A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
      </svg>
    );
  return (
    <svg {...p}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />
    </svg>
  );
}

function Beagle() {
  return (
    <svg className="dog" viewBox="0 0 200 200" role="img" aria-label="Motoperro, un beagle">
      <g className="dog-tail">
        <path d="M140 170 Q 176 156 170 120" fill="none" stroke="#c98a4f" strokeWidth="11" strokeLinecap="round" />
        <circle cx="170" cy="118" r="7" fill="#fff1df" />
      </g>
      <g className="dog-body">
        <ellipse cx="100" cy="160" rx="45" ry="35" fill="#fff1df" />
        <path d="M58 150 Q 66 124 100 126 Q 134 124 142 150 Q 120 140 100 142 Q 80 140 58 150Z" fill="#c98a4f" />
        <ellipse cx="82" cy="190" rx="15" ry="8" fill="#fff1df" />
        <ellipse cx="118" cy="190" rx="15" ry="8" fill="#fff1df" />
        <path d="M78 190v-4M86 190v-4M114 190v-4M122 190v-4" stroke="#d9c3a5" strokeWidth="2" strokeLinecap="round" />
      </g>
      <g className="dog-head">
        <g className="ear ear-l">
          <path d="M62 66 Q 38 78 40 118 Q 42 136 58 130 Q 72 110 72 78Z" fill="#6b3a1e" />
        </g>
        <g className="ear ear-r">
          <path d="M138 66 Q 162 78 160 118 Q 158 136 142 130 Q 128 110 128 78Z" fill="#6b3a1e" />
        </g>
        <ellipse cx="100" cy="88" rx="43" ry="39" fill="#c98a4f" />
        <path d="M100 50 Q 90 74 88 100 Q 100 112 112 100 Q 110 74 100 50Z" fill="#fff1df" />
        <ellipse cx="100" cy="107" rx="25" ry="18" fill="#fff1df" />
        <g className="dog-eyes">
          <ellipse cx="80" cy="86" rx="5.2" ry="6.6" fill="#2a1329" />
          <ellipse cx="120" cy="86" rx="5.2" ry="6.6" fill="#2a1329" />
          <circle cx="82" cy="83.5" r="1.9" fill="#fff" />
          <circle cx="122" cy="83.5" r="1.9" fill="#fff" />
        </g>
        <g className="dog-eyes-shut" fill="none" stroke="#2a1329" strokeWidth="3" strokeLinecap="round">
          <path d="M73 88 Q 80 95 87 88" />
          <path d="M113 88 Q 120 95 127 88" />
        </g>
        <ellipse cx="100" cy="98" rx="8.5" ry="5.8" fill="#2a1329" />
        <path className="dog-tongue" d="M94 112 Q 100 132 106 112Z" fill="#ff7aa8" />
        <path d="M100 103v6M100 109Q92 117 86 112M100 109Q108 117 114 112" fill="none" stroke="#2a1329" strokeWidth="2.4" strokeLinecap="round" />
        <g className="dog-hat">
          <path d="M100 8 L80 54 H120Z" fill="#ff7aa8" />
          <path d="M91 32 L109 32M86 44 L114 44" stroke="#fff1df" strokeWidth="4" strokeLinecap="round" />
          <circle cx="100" cy="8" r="6" fill="#ffb86b" />
        </g>
      </g>
    </svg>
  );
}

export default function Tama({ active, onExit }: { active: boolean; onExit: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<Stats>(START);
  const [mode, setMode] = useState<Mode>("idle");
  const [done, setDone] = useState<Care[]>([]);
  const [say, setSay] = useState("Motoperro te mira con ganas de que lo cuides.");
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);
  const timers = useRef<number[]>([]);
  const modeTimer = useRef<number>(0);
  const streak = useRef(0);
  const rub = useRef({ x: 0, y: 0, dist: 0, moved: false });
  const heartId = useRef(0);
  const dogBox = useRef<HTMLDivElement>(null);
  const celebrated = useRef(false);

  const complete = done.length === CARES.length;
  const sleeping = mode === "sleep";
  const { contextSafe } = useGSAP({ scope: root });

  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);
  const mark = useCallback((c: Care) => setDone((d) => (d.includes(c) ? d : [...d, c])), []);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      clearTimeout(modeTimer.current);
    },
    []
  );

  // El tiempo pasa solo mientras la cámara está aquí: las necesidades bajan; durante la siesta la energía sube.
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      setStats((s) =>
        mode === "sleep"
          ? { ...s, energy: clamp(s.energy + 7), hunger: clamp(s.hunger - 1) }
          : { hunger: clamp(s.hunger - 3), fun: clamp(s.fun - 2), energy: clamp(s.energy - 1.5), love: clamp(s.love - 1.5) }
      );
    }, 2200);
    return () => clearInterval(id);
  }, [mode, active]);

  useEffect(() => {
    if (mode !== "sleep") return;
    const t = window.setTimeout(() => mark("sleep"), 2600);
    return () => clearTimeout(t);
  }, [mode, mark]);
  useEffect(() => {
    if (mode === "sleep" && stats.energy >= 100) {
      setMode("idle");
      setSay("¡Despertó con la energía al máximo!");
    }
  }, [mode, stats.energy]);

  // Al completar los cuatro cuidados: gorro de fiesta, confeti y aparece la salida.
  useEffect(() => {
    if (!complete || celebrated.current) return;
    celebrated.current = true;
    sfx.win();
    setSay("¡Motoperro se puso su gorro! Te manda un feliz cumpleaños, ShuraHiwa.");
    const host = dogBox.current?.closest<HTMLElement>(".egg-screen");
    if (host) burst(host, host.clientWidth / 2, host.clientHeight / 2, { count: 36, shape: "confetti", distance: 200, colors: ["#ffb86b", "#ff7aa8", "#7c93ff", "#fff1df"] });
    gsap.fromTo(".egg-exit", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.7, delay: 0.8, ease: "power3.out" });
  }, [complete]);

  const run = useCallback((m: Mode, ms: number) => {
    clearTimeout(modeTimer.current);
    setMode(m);
    modeTimer.current = window.setTimeout(() => setMode("idle"), ms);
  }, []);

  const spawnHearts = (n: number) => {
    const batch = Array.from({ length: n }, () => ({ id: ++heartId.current, x: 30 + Math.random() * 40 }));
    setHearts((h) => [...h.slice(-8), ...batch]);
    batch.forEach((b) => later(() => setHearts((h) => h.filter((x) => x.id !== b.id)), 1500));
  };

  const feed = () => {
    if (stats.hunger >= 95) return setSay("Ya no le cabe ni una croqueta.");
    sfx.eat();
    streak.current += 1;
    const salmon = streak.current % 3 === 0;
    setStats((s) => ({ ...s, hunger: clamp(s.hunger + (salmon ? 45 : 28)), love: clamp(s.love + (salmon ? 8 : 2)) }));
    setSay(salmon ? "¡Salmón ahumado! Lo olió desde la otra habitación." : "Croc, croc, croc. Plato limpio.");
    run("eat", 2300);
    mark("eat");
  };
  const walk = () => {
    if (stats.energy < 20) return setSay("Está muy cansado para salir. Que duerma primero.");
    setStats((s) => ({ ...s, fun: clamp(s.fun + 32), energy: clamp(s.energy - 18), hunger: clamp(s.hunger - 8) }));
    sfx.whoosh();
    setSay("Salió corriendo detrás de una moto. ¡Casi la alcanza!");
    run("walk", 3800);
    mark("walk");
  };
  const caress = () => {
    setStats((s) => ({ ...s, love: clamp(s.love + 14) }));
    sfx.pop();
    setSay("Se derrite con las caricias.");
    run("pet", 2600);
    mark("pet");
    spawnHearts(3);
  };
  const nap = () => {
    clearTimeout(modeTimer.current);
    if (mode === "sleep") {
      setMode("idle");
      if (!celebrated.current) setSay("Se estira y bosteza.");
      return;
    }
    setMode("sleep");
    sfx.sleep();
    setSay("Se enroscó. Toca «Despertar» cuando quieras.");
  };

  // Acariciar arrastrando el dedo o el cursor sobre Motoperro.
  const onDown = (e: RPointerEvent) => {
    rub.current = { x: e.clientX, y: e.clientY, dist: 0, moved: false };
  };
  const onMove = (e: RPointerEvent) => {
    if (e.buttons === 0 && e.pointerType === "mouse") return;
    if (mode === "sleep" || mode === "walk") return;
    const r = rub.current;
    r.dist += Math.hypot(e.clientX - r.x, e.clientY - r.y);
    r.x = e.clientX;
    r.y = e.clientY;
    if (r.dist > 70) {
      r.dist = 0;
      r.moved = true;
      setStats((s) => ({ ...s, love: clamp(s.love + 5) }));
      mark("pet");
      spawnHearts(1);
      if (mode !== "pet") run("pet", 1400);
    }
  };
  const onTap = () => {
    if (rub.current.moved) {
      rub.current.moved = false;
      return;
    }
    if (mode === "sleep") return;
    sfx.bark();
    setSay("¡GUAU! ¡GUAU!");
    setStats((s) => ({ ...s, fun: clamp(s.fun + 3) }));
    const el = dogBox.current;
    if (el) {
      el.classList.remove("is-bark");
      void el.offsetWidth;
      el.classList.add("is-bark");
    }
  };

  const needs = stats.hunger < 25 ? "hungry" : stats.energy < 20 ? "tired" : stats.fun < 20 ? "bored" : "";
  const press = contextSafe((fn: () => void) => () => fn());

  return (
    <div className={`egg${complete ? " is-party" : ""}`} data-focus ref={root}>
      <i className="egg-ring" aria-hidden="true" />
      <div className={`egg-screen tama-screen mode-${mode}${needs ? ` needs-${needs}` : ""}`} data-nofx>
        <div className="screen-bg" aria-hidden="true">
          <i className="sb-window" />
          <i className="sb-ground" />
          <span className="sb-scenery sb-s1" />
          <span className="sb-scenery sb-s2" />
          <svg className="sb-moto" viewBox="0 0 80 40" aria-hidden="true">
            <circle cx="14" cy="28" r="9" fill="none" stroke="#2a1329" strokeWidth="3" />
            <circle cx="64" cy="28" r="9" fill="none" stroke="#2a1329" strokeWidth="3" />
            <path d="M14 28 L30 14 H48 L64 28 M30 14 L24 8 H18 M46 14 L52 6" fill="none" stroke="#e0589c" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <svg className="sb-bowl" viewBox="0 0 80 40" aria-hidden="true">
            <circle className="kibble k1" cx="30" cy="8" r="4" fill="#a8642f" />
            <circle className="kibble k2" cx="42" cy="8" r="4" fill="#c98a4f" />
            <circle className="kibble k3" cx="52" cy="8" r="4" fill="#a8642f" />
            <path d="M10 18 H70 L64 36 Q 62 40 56 40 H24 Q 18 40 16 36Z" fill="#7c93ff" />
            <path d="M10 18 H70" stroke="#fff1df" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        <ul className="egg-meters">
          {METERS.map((m) => (
            <li key={m.key} className={stats[m.key] < 25 ? "low" : ""}>
              <Icon name={m.icon} />
              <i role="meter" aria-label={m.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(stats[m.key])} style={{ "--v": stats[m.key] / 100 } as CSSProperties} />
            </li>
          ))}
        </ul>

        <div className="dog-box" ref={dogBox} onPointerDown={onDown} onPointerMove={onMove} onClick={onTap} onAnimationEnd={(e) => e.currentTarget.classList.remove("is-bark")}>
          <Beagle />
        </div>

        {sleeping && (
          <div className="zzz" aria-hidden="true">
            <b>z</b>
            <b>z</b>
            <b>Z</b>
          </div>
        )}
        <div className="hearts" aria-hidden="true">
          {hearts.map((h) => (
            <i key={h.id} style={{ left: h.x + "%" } as CSSProperties} />
          ))}
        </div>
        <p className="tama-say" aria-hidden="true" key={say}>
          {say}
        </p>
        <span className="scan" aria-hidden="true" />
      </div>
      <p className="sr-only" aria-live="polite">
        {say}
      </p>

      <div className="tama-buttons egg-buttons" role="group" aria-label="Cuidados">
        <button type="button" className="tama-btn" onClick={press(feed)} disabled={sleeping} data-done={done.includes("eat")}>
          <Icon name="eat" />
          <span>Croquetas</span>
        </button>
        <button type="button" className="tama-btn" onClick={press(walk)} disabled={sleeping} data-done={done.includes("walk")}>
          <Icon name="walk" />
          <span>Paseo</span>
        </button>
        <button type="button" className="tama-btn" onClick={press(caress)} disabled={sleeping} data-done={done.includes("pet")}>
          <Icon name="pet" />
          <span>Caricias</span>
        </button>
        <button type="button" className="tama-btn" onClick={press(nap)} data-done={done.includes("sleep")}>
          <Icon name="sleep" />
          <span>{sleeping ? "Despertar" : "Siesta"}</span>
        </button>
      </div>

      <div className="egg-foot">
        {complete ? (
          <button type="button" className="btn btn-go egg-exit" onClick={onExit} data-nofx>
            Salir del tamagochi
          </button>
        ) : (
          <>
            <ul className="egg-paws" aria-label="Cuidados probados">
              {CARES.map((c) => (
                <li key={c.key} className={done.includes(c.key) ? "on" : ""} title={done.includes(c.key) ? `Ya ${c.done}` : "Pendiente"}>
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                    <ellipse cx="12" cy="16" rx="5" ry="4.2" />
                    <ellipse cx="5.5" cy="11" rx="2" ry="2.6" />
                    <ellipse cx="9.5" cy="6.8" rx="2" ry="2.6" />
                    <ellipse cx="14.5" cy="6.8" rx="2" ry="2.6" />
                    <ellipse cx="18.5" cy="11" rx="2" ry="2.6" />
                  </svg>
                </li>
              ))}
            </ul>
            <p className="egg-hint">Cuida a Motoperro · {done.length} de {CARES.length}</p>
            <p className="egg-tip">Arrastra el dedo sobre él para acariciarlo, o tócalo para que ladre.</p>
          </>
        )}
      </div>
    </div>
  );
}
