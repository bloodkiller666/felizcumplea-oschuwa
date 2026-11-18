import type { CSSProperties } from "react";
import { FLOOR, CEIL, WALL_Z, WALL_W } from "@/lib/room";

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

const NeonController = () => (
  <svg className="neon-pad" viewBox="0 0 300 180" aria-hidden="true">
    <path d="M62 40 Q32 40 22 92 Q14 142 42 150 Q64 156 82 130 L102 110 H198 L218 130 Q236 156 258 150 Q286 142 278 92 Q268 40 238 40 Z" />
    <path d="M72 68 v36 M54 86 h36" />
    <circle cx="226" cy="72" r="9" />
    <circle cx="250" cy="94" r="9" />
  </svg>
);

export default function Scene() {
  return (
    <>
      {/* Pared con sus cosas */}
      <div className="wall" aria-hidden="true">
        <div className="wall-pattern" />
        <div className="wall-base" />
        <div className="wall-window" style={wallPos(-1150, -330, 470, 420)}>
          <i className="sun" />
          <i className="blinds" />
        </div>
        <div style={wallPos(250, -300, 420, 260)}>
          <NeonController />
        </div>
        <div className="wall-neon" style={wallPos(1000, -330, 560, 110)}>Shake Gang</div>
        <i className="rgb-strip" style={wallPos(900, 114, 760, 500)} />
        <i className="poster p1" style={wallPos(-1780, -200, 220, 300)} />
        <i className="poster p2" style={wallPos(1740, -380, 220, 300)} />
        <i className="poster p3" style={wallPos(-560, -430, 190, 250)} />
        <i className="light-switch" style={wallPos(-2250, 160, 40, 64)} />
      </div>

      {/* Techo, piso y alfombra */}
      <div className="ceiling" aria-hidden="true">
        <i className="ceil-lamp" />
      </div>
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
