"use client";

import { memo, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { SecretId } from "@/lib/room";
import { FLOOR, CEIL, WALL_Z, WALL_W, DOOR_Z, DOOR_W, DOOR_TOP } from "@/lib/room";

/*
  El cuarto (decorado). Todo está en coordenadas del mundo (x → derecha, y → abajo, z → hacia quien mira).
  Izquierda: la cama (con el tamagochi encima). Centro: el estante de las consolas. Derecha: el escritorio con la PC,
  la torre, el mueble de cajones y la silla. Lo que cuelga de la pared va dentro de `.wall`; lo demás son "props" sueltos.
*/

/** Posiciona un prop: ancla = punto del prop que cae en (x, y, z). */
const at = (x: number, y: number, z: number, anchor = "-50%, -100%", extra = ""): CSSProperties => ({
  transform: `translate3d(${x}px, ${y}px, ${z}px) ${extra} translate(${anchor})`,
});
/** Lugar en la pared (coordenadas del mundo → coordenadas locales de la pared). */
const wallPos = (cx: number, cy: number, w: number, h: number): CSSProperties => ({
  left: cx + WALL_W / 2 - w / 2,
  top: cy - CEIL - h / 2,
  width: w,
  height: h,
});

/** Coloca un panel suelto en el mundo (esquina superior izquierda en x, y, z). */
const pl = (x: number, y: number, z: number): CSSProperties => ({ transform: `translate3d(${x}px, ${y}px, ${z}px)` });
const HALF = DOOR_W / 2;
const DOOR_H = FLOOR - DOOR_TOP;

const Headphones = () => (
  <svg viewBox="0 0 120 110" aria-hidden="true">
    <path d="M18 70 V54 a42 42 0 0 1 84 0 V70" fill="none" stroke="#2a1d36" strokeWidth="9" strokeLinecap="round" />
    <rect x="8" y="64" width="26" height="40" rx="12" fill="#ff7aa8" />
    <rect x="86" y="64" width="26" height="40" rx="12" fill="#ff7aa8" />
    <rect x="12" y="70" width="12" height="28" rx="6" fill="#c24a7a" />
    <rect x="96" y="70" width="12" height="28" rx="6" fill="#c24a7a" />
  </svg>
);

const Controller = ({ color = "#7c93ff" }: { color?: string }) => (
  <svg viewBox="0 0 120 70" aria-hidden="true">
    <path d="M24 14 Q6 14 4 44 Q4 62 18 62 Q28 62 34 50 H86 Q92 62 102 62 Q116 62 116 44 Q114 14 96 14 Z" fill={color} />
    <path d="M30 28 v18 M21 37 h18" stroke="#1d1124" strokeWidth="5" strokeLinecap="round" />
    <circle cx="88" cy="30" r="5" fill="#fff1df" />
    <circle cx="100" cy="40" r="5" fill="#fff1df" />
  </svg>
);

const Cactus = () => (
  <svg viewBox="0 0 80 110" aria-hidden="true">
    <rect x="28" y="20" width="24" height="64" rx="12" fill="#3dbb7d" />
    <path d="M28 56 h-10 a8 8 0 0 1 -8 -8 v-12 a7 7 0 0 1 14 0 v10 h4Z" fill="#3dbb7d" />
    <path d="M52 48 h10 a8 8 0 0 0 8 -8 v-10 a7 7 0 0 0 -14 0 v8 h-4Z" fill="#3dbb7d" />
    <path d="M18 84 h44 l-6 24 h-32Z" fill="#ff9f7a" />
  </svg>
);

const Cases = () => (
  <svg viewBox="0 0 200 110" aria-hidden="true">
    {["#7c93ff", "#ff7aa8", "#ffb86b", "#3dbb7d", "#c9a8ff", "#e5484d", "#7c93ff", "#ffb86b"].map((c, i) => (
      <g key={i} transform={`translate(${6 + i * 23} ${i % 3 === 1 ? 6 : 0})`}>
        <rect width="20" height="104" rx="3" fill={c} />
        <rect x="4" y="10" width="12" height="3" rx="1.5" fill="#fff1df" opacity="0.8" />
        <rect x="4" y="18" width="8" height="3" rx="1.5" fill="#fff1df" opacity="0.5" />
      </g>
    ))}
  </svg>
);

const GameBox = () => (
  <svg viewBox="0 0 150 100" aria-hidden="true">
    <rect x="4" y="14" width="142" height="82" rx="10" fill="#f2ecf7" />
    <rect x="4" y="14" width="142" height="14" rx="7" fill="#c9bfd6" />
    {[0, 1, 2, 3].map((i) => (
      <circle key={i} cx={36 + i * 26} cy="64" r="8" fill="#6a5a7a" />
    ))}
    <rect x="62" y="34" width="26" height="8" rx="4" fill="#6a5a7a" />
  </svg>
);

const Chair = () => (
  <svg viewBox="0 0 340 600" aria-hidden="true">
    <rect x="148" y="400" width="44" height="120" rx="10" fill="#2a1d36" />
    <path d="M30 560 L170 520 L310 560" fill="none" stroke="#2a1d36" strokeWidth="16" strokeLinecap="round" />
    {[30, 110, 170, 230, 310].map((x) => (
      <circle key={x} cx={x} cy="574" r="14" fill="#1d1124" />
    ))}
    <rect x="60" y="330" width="220" height="86" rx="34" fill="#ff8a4c" />
    <rect x="76" y="40" width="190" height="300" rx="70" fill="#ff8a4c" />
    <rect x="104" y="72" width="134" height="220" rx="50" fill="#ffb07a" />
    <rect x="18" y="300" width="52" height="22" rx="11" fill="#2a1d36" />
    <rect x="272" y="300" width="52" height="22" rx="11" fill="#2a1d36" />
    <rect x="30" y="316" width="22" height="70" rx="8" fill="#2a1d36" />
    <rect x="288" y="316" width="22" height="70" rx="8" fill="#2a1d36" />
  </svg>
);

const Bed = () => (
  <svg viewBox="0 0 860 420" aria-hidden="true">
    <rect x="20" y="0" width="820" height="270" rx="40" fill="#3a1d4a" />
    <rect x="48" y="26" width="764" height="220" rx="28" fill="#4d2a62" />
    <rect x="10" y="200" width="840" height="150" rx="26" fill="#7c4bd6" />
    <rect x="10" y="200" width="840" height="42" rx="21" fill="#b79cff" />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={40 + i * 160} y="262" width="80" height="70" rx="12" fill="#6a3fc2" />
    ))}
    <rect x="30" y="344" width="800" height="40" rx="8" fill="#2a1d36" />
    {[40, 780].map((x) => (
      <rect key={x} x={x} y="380" width="40" height="40" rx="6" fill="#1d1124" />
    ))}
    <rect x="60" y="150" width="240" height="72" rx="30" fill="#fff1df" />
    <rect x="560" y="150" width="240" height="72" rx="30" fill="#ffd9c4" />
  </svg>
);

const SideTable = () => (
  <svg viewBox="0 0 200 330" aria-hidden="true">
    <path d="M100 0 c-34 0 -48 34 -48 56 h96 c0 -22 -14 -56 -48 -56Z" fill="#ffd9a0" />
    <rect x="96" y="56" width="8" height="46" fill="#6a5a7a" />
    <rect x="14" y="100" width="172" height="26" rx="6" fill="#f2ecf7" />
    <rect x="24" y="126" width="152" height="190" rx="6" fill="#f2ecf7" />
    <rect x="34" y="140" width="132" height="70" rx="5" fill="#d9cfe6" />
    <rect x="34" y="222" width="132" height="70" rx="5" fill="#d9cfe6" />
    <rect x="84" y="168" width="32" height="8" rx="4" fill="#6a5a7a" />
    <rect x="84" y="250" width="32" height="8" rx="4" fill="#6a5a7a" />
    <rect x="30" y="316" width="14" height="14" fill="#6a5a7a" />
    <rect x="156" y="316" width="14" height="14" fill="#6a5a7a" />
    <rect x="132" y="82" width="34" height="28" rx="6" fill="#ff7aa8" />
  </svg>
);

const Tower = () => (
  <div className="tower" aria-hidden="true">
    <div className="tower-glass">
      {[0, 1, 2].map((i) => (
        <i key={i} className="tower-fan" style={{ animationDelay: `${i * -0.5}s` }} />
      ))}
    </div>
    <i className="tower-led" />
  </div>
);

/* ───────── Decoración de los extremos: peluches, juguetes y cositas ───────── */
const Teddy = ({ fur = "#c98a4f", belly = "#f0c999", bow = "#ff7aa8" }: { fur?: string; belly?: string; bow?: string }) => (
  <svg viewBox="0 0 200 235" aria-hidden="true">
    <circle cx="54" cy="40" r="23" fill={fur} />
    <circle cx="146" cy="40" r="23" fill={fur} />
    <circle cx="54" cy="40" r="11" fill={belly} />
    <circle cx="146" cy="40" r="11" fill={belly} />
    <ellipse cx="100" cy="165" rx="64" ry="62" fill={fur} />
    <ellipse cx="100" cy="174" rx="38" ry="42" fill={belly} />
    <ellipse cx="40" cy="152" rx="17" ry="30" fill={fur} transform="rotate(24 40 152)" />
    <ellipse cx="160" cy="152" rx="17" ry="30" fill={fur} transform="rotate(-24 160 152)" />
    <ellipse cx="68" cy="219" rx="27" ry="15" fill={fur} />
    <ellipse cx="132" cy="219" rx="27" ry="15" fill={fur} />
    <circle cx="68" cy="219" r="9" fill={belly} />
    <circle cx="132" cy="219" r="9" fill={belly} />
    <circle cx="100" cy="78" r="52" fill={fur} />
    <ellipse cx="100" cy="94" rx="25" ry="19" fill={belly} />
    <ellipse cx="100" cy="86" rx="8" ry="5.5" fill="#3a1d33" />
    <circle cx="80" cy="68" r="5.5" fill="#2a1329" />
    <circle cx="120" cy="68" r="5.5" fill="#2a1329" />
    <circle cx="78" cy="66" r="1.8" fill="#fff" />
    <circle cx="118" cy="66" r="1.8" fill="#fff" />
    <path d="M91 98 q9 8 18 0" stroke="#3a1d33" strokeWidth="3" fill="none" strokeLinecap="round" />
    <circle cx="68" cy="88" r="7" fill="#ff9fbf" opacity="0.55" />
    <circle cx="132" cy="88" r="7" fill="#ff9fbf" opacity="0.55" />
    <path d="M100 128 l-24 -13 v26Z M100 128 l24 -13 v26Z" fill={bow} />
    <circle cx="100" cy="128" r="7" fill="#e0589c" />
  </svg>
);

const Bunny = ({ fur = "#fff1df", inner = "#ffb3c8" }: { fur?: string; inner?: string }) => (
  <svg viewBox="0 0 160 230" aria-hidden="true">
    <ellipse cx="56" cy="46" rx="16" ry="44" fill={fur} transform="rotate(-8 56 46)" />
    <ellipse cx="104" cy="46" rx="16" ry="44" fill={fur} transform="rotate(8 104 46)" />
    <ellipse cx="56" cy="50" rx="7" ry="30" fill={inner} transform="rotate(-8 56 50)" />
    <ellipse cx="104" cy="50" rx="7" ry="30" fill={inner} transform="rotate(8 104 50)" />
    <ellipse cx="80" cy="168" rx="52" ry="56" fill={fur} />
    <ellipse cx="34" cy="160" rx="13" ry="26" fill={fur} transform="rotate(20 34 160)" />
    <ellipse cx="126" cy="160" rx="13" ry="26" fill={fur} transform="rotate(-20 126 160)" />
    <ellipse cx="56" cy="218" rx="22" ry="11" fill={fur} />
    <ellipse cx="104" cy="218" rx="22" ry="11" fill={fur} />
    <circle cx="80" cy="102" r="44" fill={fur} />
    <circle cx="64" cy="98" r="4.5" fill="#2a1329" />
    <circle cx="96" cy="98" r="4.5" fill="#2a1329" />
    <path d="M74 110 l6 5 l6 -5Z" fill="#ff7aa8" />
    <path d="M80 115 v5 M72 122 q8 6 16 0" stroke="#3a1d33" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <circle cx="52" cy="112" r="6" fill="#ff9fbf" opacity="0.55" />
    <circle cx="108" cy="112" r="6" fill="#ff9fbf" opacity="0.55" />
    <circle cx="80" cy="170" r="12" fill={inner} opacity="0.5" />
  </svg>
);

const Beanbag = () => (
  <svg viewBox="0 0 270 190" aria-hidden="true">
    <path d="M18 168 Q4 92 82 58 Q128 36 176 58 Q262 92 252 168 Q250 184 210 184 H58 Q20 184 18 168Z" fill="#ff9fbf" />
    <path d="M82 58 Q100 100 86 180 M176 58 Q164 100 190 180" stroke="#e0589c" strokeWidth="3" fill="none" opacity="0.5" />
    <path d="M60 90 Q96 56 150 52" stroke="#fff1df" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.45" />
    <path d="M30 176 H240" stroke="#c24a7a" strokeWidth="6" strokeLinecap="round" opacity="0.4" />
  </svg>
);

const ToyBasket = () => (
  <svg viewBox="0 0 240 210" aria-hidden="true">
    <circle cx="70" cy="60" r="34" fill="#c9a8ff" />
    <circle cx="46" cy="34" r="12" fill="#c9a8ff" /><circle cx="94" cy="34" r="12" fill="#c9a8ff" />
    <circle cx="60" cy="56" r="4" fill="#2a1329" /><circle cx="82" cy="56" r="4" fill="#2a1329" />
    <path d="M64 70 q6 6 12 0" stroke="#2a1329" strokeWidth="3" fill="none" strokeLinecap="round" />
    <rect x="128" y="36" width="70" height="70" rx="12" fill="#7c93ff" transform="rotate(10 163 71)" />
    <text x="146" y="86" fontSize="40" fontWeight="800" fill="#fff1df" transform="rotate(10 163 71)" fontFamily="var(--font-display-stack)">A</text>
    <circle cx="116" cy="62" r="26" fill="#ffb86b" />
    <path d="M100 60 q16 -14 32 0" stroke="#fff1df" strokeWidth="3" fill="none" />
    <path d="M30 96 H210 L196 196 Q194 204 184 204 H56 Q46 204 44 196Z" fill="#d9a066" />
    <path d="M36 120 H204 M40 146 H200 M44 172 H196" stroke="#a8642f" strokeWidth="5" opacity="0.6" />
    <path d="M62 98 v104 M100 98 v106 M140 98 v106 M178 98 v104" stroke="#a8642f" strokeWidth="4" opacity="0.5" />
    <rect x="22" y="88" width="196" height="16" rx="8" fill="#c98a4f" />
  </svg>
);

const StarLamp = () => (
  <svg viewBox="0 0 160 520" aria-hidden="true">
    <path d="M80 18 l15 34 l37 4 l-28 25 l9 37 l-33 -19 l-33 19 l9 -37 l-28 -25 l37 -4Z" fill="#ffe08a" stroke="#ffb86b" strokeWidth="5" strokeLinejoin="round" />
    <path d="M80 118 V496" stroke="#6a5a7a" strokeWidth="9" strokeLinecap="round" />
    <ellipse cx="80" cy="502" rx="52" ry="12" fill="#3a2a45" />
  </svg>
);

const Wardrobe = () => (
  <svg viewBox="0 0 260 520" aria-hidden="true">
    <rect x="10" y="0" width="240" height="500" rx="14" fill="#f2ecf7" />
    <rect x="22" y="14" width="106" height="470" rx="8" fill="#d9cfe6" />
    <rect x="132" y="14" width="106" height="470" rx="8" fill="#d9cfe6" />
    <rect x="34" y="28" width="82" height="442" rx="6" fill="#bfe3ff" />
    <path d="M44 60 l50 -20 M44 130 l66 -26 M44 200 l66 -26" stroke="#fff" strokeWidth="9" strokeLinecap="round" opacity="0.55" />
    <path d="M148 60 h76 M148 80 h50" stroke="#c24a7a" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
    <path d="M186 196 c-18 -12 -24 -28 -10 -34 c6 -3 10 2 10 6 c0 -4 4 -9 10 -6 c14 6 8 22 -10 34Z" fill="#ff7aa8" />
    <circle cx="124" cy="260" r="7" fill="#6a5a7a" /><circle cx="136" cy="260" r="7" fill="#6a5a7a" />
    <rect x="24" y="496" width="22" height="24" fill="#6a5a7a" /><rect x="214" y="496" width="22" height="24" fill="#6a5a7a" />
  </svg>
);

const Plant = () => (
  <svg viewBox="0 0 200 300" aria-hidden="true">
    <path d="M100 190 C70 120 20 100 18 40 C70 50 96 100 100 190Z" fill="#3dbb7d" />
    <path d="M100 190 C132 110 182 94 186 30 C130 44 104 100 100 190Z" fill="#2fa56a" />
    <path d="M100 190 C96 120 92 70 100 10 C118 70 112 130 100 190Z" fill="#4fd096" />
    <path d="M100 190 C60 160 30 170 14 130 C56 126 90 150 100 190Z" fill="#2fa56a" />
    <path d="M52 190 h96 l-14 100 q-2 8 -10 8 h-48 q-8 0 -10 -8Z" fill="#ff9f7a" />
    <rect x="46" y="180" width="108" height="20" rx="8" fill="#e0805a" />
  </svg>
);

const WallShelf = ({ flip = false }: { flip?: boolean }) => (
  <svg viewBox="0 0 360 150" aria-hidden="true" style={flip ? { transform: "scaleX(-1)" } : undefined}>
    <rect x="6" y="116" width="348" height="16" rx="6" fill="#d9a066" />
    <rect x="30" y="132" width="14" height="14" fill="#a8642f" /><rect x="316" y="132" width="14" height="14" fill="#a8642f" />
    <circle cx="70" cy="86" r="26" fill="#ffd9c4" /><circle cx="52" cy="64" r="9" fill="#ffd9c4" /><circle cx="88" cy="64" r="9" fill="#ffd9c4" />
    <circle cx="62" cy="84" r="3.5" fill="#2a1329" /><circle cx="78" cy="84" r="3.5" fill="#2a1329" /><path d="M66 94 q4 4 8 0" stroke="#2a1329" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <rect x="120" y="60" width="22" height="56" rx="3" fill="#7c93ff" /><rect x="144" y="70" width="20" height="46" rx="3" fill="#ff7aa8" /><rect x="166" y="56" width="24" height="60" rx="3" fill="#ffb86b" />
    <path d="M238 116 v-40 a20 20 0 0 1 40 0 v40Z" fill="#c9a8ff" /><circle cx="248" cy="86" r="3.5" fill="#2a1329" /><circle cx="268" cy="86" r="3.5" fill="#2a1329" /><path d="M254 96 q4 4 8 0" stroke="#2a1329" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M300 116 c-16 -14 -22 -30 -8 -36 c6 -3 10 2 10 6 c0 -4 4 -9 10 -6 c14 6 8 22 -12 36Z" fill="#ff5a8a" />
  </svg>
);

const Pennants = () => (
  <svg viewBox="0 0 800 130" aria-hidden="true">
    <path d="M0 10 Q400 80 800 10" fill="none" stroke="#c9bfd6" strokeWidth="4" />
    {[60, 150, 240, 330, 420, 510, 600, 690].map((x, i) => {
      const y = Math.round(10 + 70 * Math.sin((x / 800) * Math.PI) * 0.9);
      return <path key={x} d={`M${x - 28} ${y} h56 l-28 60Z`} fill={["#ff7aa8", "#ffb86b", "#7c93ff", "#3dbb7d", "#c9a8ff"][i % 5]} />;
    })}
  </svg>
);

const NeonHeart = () => (
  <svg className="neon-pad" viewBox="0 0 200 180" aria-hidden="true">
    <path d="M100 160 C20 100 6 54 40 32 C66 16 92 30 100 52 C108 30 134 16 160 32 C194 54 180 100 100 160Z" />
  </svg>
);

const NeonController = () => (
  <svg className="neon-pad" viewBox="0 0 300 180" aria-hidden="true">
    <path d="M62 40 Q32 40 22 92 Q14 142 42 150 Q64 156 82 130 L102 110 H198 L218 130 Q236 156 258 150 Q286 142 278 92 Q268 40 238 40 Z" />
    <path d="M72 68 v36 M54 86 h36" />
    <circle cx="226" cy="72" r="9" />
    <circle cx="250" cy="94" r="9" />
  </svg>
);

type SceneProps = { armed: boolean; onFind: (id: SecretId, el: HTMLElement) => void };

/** Un objeto del cuarto que se puede tocar (solo desde la vista general). */
function Secret({ id, label, armed, onFind, style, children }: { id: SecretId; label: string; style: CSSProperties; children: ReactNode } & SceneProps) {
  return (
    <div
      className="prop secret"
      role="button"
      aria-label={label}
      tabIndex={armed ? 0 : -1}
      style={style}
      onClick={(e) => onFind(id, e.currentTarget)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onFind(id, e.currentTarget);
        }
      }}
    >
      {children}
    </div>
  );
}

/** Reloj de pared con la hora real. */
function WallClock() {
  const [t, setT] = useState<{ h: number; m: number } | null>(null);
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setT({ h: d.getHours() % 12, m: d.getMinutes() });
    };
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, []);
  const hr = t ? (t.h + t.m / 60) * 30 : 0;
  const mn = t ? t.m * 6 : 0;
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className="wall-clock">
      <circle cx="50" cy="50" r="47" fill="#ffb8d0" stroke="#c24a7a" strokeWidth="5" />
      <circle cx="50" cy="50" r="38" fill="#fff6ea" />
      {[...Array(12)].map((_, i) => (
        <rect key={i} x="48.8" y="15" width={i % 3 ? 2.4 : 3.6} height={i % 3 ? 5 : 8} rx="1.2" fill="#7a3a5a" transform={`rotate(${i * 30} 50 50)`} />
      ))}
      <g style={{ opacity: t ? 1 : 0 }}>
        <rect x="47.6" y="28" width="4.8" height="25" rx="2.4" fill="#4a2447" transform={`rotate(${hr} 50 50)`} />
        <rect x="48.5" y="19" width="3" height="34" rx="1.5" fill="#7c93ff" transform={`rotate(${mn} 50 50)`} />
      </g>
      <circle cx="50" cy="50" r="3.6" fill="#c24a7a" />
    </svg>
  );
}

function Scene({ armed, onFind }: SceneProps) {
  const sp = { armed, onFind };
  return (
    <>
      {/* Pared con sus cosas */}
      <div className="wall" aria-hidden="true">
        <div className="wall-pattern" />
        <div className="wall-base" />
        <div className="wall-window secret" style={wallPos(-1150, -330, 470, 420)} onClick={(e) => onFind("window", e.currentTarget)}>
          <i className="sun" />
          <i className="blinds" />
        </div>
        <div style={wallPos(250, -300, 420, 260)}>
          <NeonController />
        </div>
        <div style={wallPos(1380, -650, 150, 150)}>
          <WallClock />
        </div>
        <div className="wall-neon" style={wallPos(1000, -330, 560, 110)}>Shake Gang</div>
        <i className="poster p1" style={wallPos(-1780, -560, 220, 300)} />
        <i className="poster p2" style={wallPos(1740, -740, 220, 300)} />
        <i className="poster p3" style={wallPos(-560, -800, 190, 250)} />
        <div style={wallPos(-2250, -20, 360, 150)}><WallShelf /></div>
        <div style={wallPos(2350, -60, 360, 150)}><WallShelf flip /></div>
        <div style={wallPos(-2150, -760, 800, 130)}><Pennants /></div>
        <div style={wallPos(2500, -760, 800, 130)}><Pennants /></div>
        <i className="poster p4" style={wallPos(-2560, -380, 200, 280)} />
        <i className="poster p5" style={wallPos(2620, -330, 200, 280)} />
        <div style={wallPos(-2060, -330, 170, 150)}><NeonHeart /></div>
        <div style={wallPos(2050, -470, 180, 160)}><NeonHeart /></div>
        <i className="light-switch" style={wallPos(-2250, 160, 40, 64)} />
      </div>

      {/* Paredes laterales: cierran el cuarto para que, al girar, no se vea el vacío */}
      <i className="side-wall" aria-hidden="true" style={{ transform: `translate3d(-3000px, ${CEIL}px, ${DOOR_Z}px) rotateY(90deg)` }} />
      <i className="side-wall" aria-hidden="true" style={{ transform: `translate3d(3000px, ${CEIL}px, ${DOOR_Z}px) rotateY(90deg)` }} />

      {/* La puerta: una pared con su hueco, el marco, la hoja que gira y el pasillo (piso y fondo) para que nada flote */}
      <div className="door-set" aria-hidden="true">
        <i className="dw dw-l" style={{ ...pl(-3000, CEIL, DOOR_Z), width: 3000 - HALF, height: FLOOR - CEIL }} />
        <i className="dw dw-r" style={{ ...pl(HALF, CEIL, DOOR_Z), width: 3000 - HALF, height: FLOOR - CEIL }} />
        <i className="dw dw-t" style={{ ...pl(-HALF, CEIL, DOOR_Z), width: DOOR_W, height: DOOR_TOP - CEIL }} />
        <i className="door-frame" style={{ ...pl(-HALF - 18, DOOR_TOP - 18, DOOR_Z + 2), width: DOOR_W + 36, height: DOOR_H + 18 }} />
        <div className="door-leaf" style={{ width: DOOR_W, height: DOOR_H, transform: `translate3d(${-HALF}px, ${DOOR_TOP}px, ${DOOR_Z + 3}px) rotateY(calc(var(--door, 0) * 1deg))` }}>
          <i className="door-panel dp-a" />
          <i className="door-panel dp-b" />
          <i className="door-panel dp-c" />
          <i className="door-panel dp-d" />
          <i className="door-knob" />
        </div>
        <i className="door-plaque" style={{ ...pl(-HALF - 560, 90, DOOR_Z + 2) }}>Cuarto de ShuraHiwa</i>
        <i className="door-lamp" style={{ ...pl(HALF + 330, 0, DOOR_Z + 2) }} />
        <div className="hall-floor">
          <i className="hall-mat" />
        </div>
        <i className="hall-back" />
      </div>

      {/* Piso y alfombra */}
      <div className="floor" aria-hidden="true">
        <i className="rug" />
      </div>

      {/* Izquierda: la cama y la mesita */}
      <div className="prop bed" aria-hidden="true" style={{ width: 860, height: 420, ...at(-1150, FLOOR, WALL_Z + 190) }}>
        <Bed />
      </div>
      <div className="prop side-table" aria-hidden="true" style={{ width: 170, height: 280, ...at(-600, FLOOR, WALL_Z + 170) }}>
        <SideTable />
        <i className="lamp-glow" />
      </div>

      {/* Izquierda de la cama: puff, peluches, canasta de juguetes y lámpara */}
      <div className="prop" aria-hidden="true" style={{ width: 300, height: 211, ...at(-1960, FLOOR, WALL_Z + 260) }}>
        <Beanbag />
      </div>
      <Secret id="bunny" label="Conejito" {...sp} style={{ width: 118, height: 169, ...at(-1930, FLOOR - 120, WALL_Z + 280) }}>
        <Bunny />
      </Secret>
      <Secret id="teddy" label="Osito de peluche" {...sp} style={{ width: 260, height: 306, ...at(-2330, FLOOR, WALL_Z + 330) }}>
        <Teddy />
      </Secret>
      <Secret id="basket" label="Canasta de juguetes" {...sp} style={{ width: 230, height: 201, ...at(-2640, FLOOR, WALL_Z + 270) }}>
        <ToyBasket />
      </Secret>
      <Secret id="star" label="Lámpara de estrella" {...sp} style={{ width: 110, height: 330, ...at(-2870, FLOOR, WALL_Z + 200) }}>
        <StarLamp />
      </Secret>

      {/* Derecha de la PC: armario con espejo, peluche gigante, planta y lámpara */}
      <Secret id="mirror" label="Espejo del armario" {...sp} style={{ width: 230, height: 460, ...at(1930, FLOOR, WALL_Z + 190) }}>
        <Wardrobe />
      </Secret>
      <Secret id="giant" label="Peluche gigante" {...sp} style={{ width: 320, height: 376, ...at(2300, FLOOR, WALL_Z + 380) }}>
        <Teddy fur="#ffc9dd" belly="#fff1df" bow="#7c93ff" />
      </Secret>
      <Secret id="plant" label="Planta" {...sp} style={{ width: 150, height: 240, ...at(2580, FLOOR - 0, WALL_Z + 150) }}>
        <Plant />
      </Secret>
      <div className="prop" aria-hidden="true" style={{ width: 104, height: 128, ...at(2570, FLOOR - 0, WALL_Z + 420) }}>
        <Bunny fur="#e8dcff" inner="#c9a8ff" />
      </div>
      <div className="prop" aria-hidden="true" style={{ width: 110, height: 330, ...at(2850, FLOOR, WALL_Z + 200) }}>
        <StarLamp />
      </div>

      {/* Centro: el estante de las consolas */}
      <div className="prop shelf" aria-hidden="true" style={{ width: 520, height: 920, ...at(-250, FLOOR, WALL_Z + 120) }}>
        {[0, 1, 2, 3].map((i) => (
          <div className={`shelf-lv lv${i}`} key={i} />
        ))}
        <div className="deco" style={{ left: 40, top: 109, width: 110 }}><Headphones /></div>
        <div className="deco" style={{ left: 260, top: 105, width: 190 }}><Cases /></div>
        <div className="deco" style={{ left: 34, top: 368, width: 110 }}><Controller /></div>
        <div className="deco" style={{ left: 410, top: 341, width: 66 }}><Cactus /></div>
        <div className="deco" style={{ left: 392, top: 600, width: 90 }}><Cases /></div>
        <div className="deco" style={{ left: 30, top: 778, width: 150 }}><GameBox /></div>
        <div className="deco" style={{ left: 230, top: 814, width: 110 }}><Controller color="#ff7aa8" /></div>
      </div>

      {/* Derecha: escritorio, torre, teclado, mueble de cajones y silla */}
      <div className="prop desk-top" aria-hidden="true" style={{ ...at(1060, 390, -290, "-50%, -50%", "rotateX(90deg)") }} />
      <div className="prop desk-edge" aria-hidden="true" style={at(1060, 424, -100, "-50%, -100%")} />
      <div className="prop desk-leg" aria-hidden="true" style={at(662, FLOOR, -110)} />
      <div className="prop drawers" aria-hidden="true" style={at(1430, FLOOR, -110)}>
        {[0, 1, 2].map((i) => (
          <i key={i} />
        ))}
      </div>
      <div className="prop keyboard" aria-hidden="true" style={at(900, 390, -170, "-50%, -50%", "rotateX(90deg)")}>
        <i className="keys" />
      </div>
      <div className="prop tower-wrap" aria-hidden="true" style={at(1250, 390, -250)}>
        <Tower />
      </div>
      <div className="prop prop-near chair" aria-hidden="true" style={{ width: 340, height: 600, ...at(720, FLOOR, 10) }}>
        <Chair />
      </div>
    </>
  );
}

export default memo(Scene);
