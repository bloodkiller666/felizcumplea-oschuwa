"use client";

import { sfx } from "@/lib/sfx";

import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { gsap } from "@/lib/gsap";

/*
  Motoperro Maze: laberinto en canvas a 240×160 (la resolución real de una Game Boy Advance), escalado sin suavizar.
  Motoperro busca el salmón ahumado; los tomates patrullan los pasillos y hay que esquivarlos. Tres laberintos,
  generados con una semilla fija (siempre son los mismos y siempre tienen salida).
*/
export type Dir = { dx: number; dy: number };

const COLS = 15;
const ROWS = 9;
const T = 16;
const W = COLS * T;
const H = ROWS * T + 16; // 16 px de barra inferior

const LEVELS = [
  { seed: 7, loops: 8, tomatoes: 1, tomatoMs: 270 },
  { seed: 31, loops: 7, tomatoes: 1, tomatoMs: 245 },
  { seed: 58, loops: 7, tomatoes: 2, tomatoMs: 225 },
] as const;
const PLAYER_MS = 105;

type Pt = { x: number; y: number };
type Ent = { x: number; y: number; px: number; py: number; t: number; dir: Dir };

const rng = (seed: number) => {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

function makeLevel(i: number) {
  const L = LEVELS[i];
  const r = rng(L.seed);
  const g: number[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(1));
  const stack: Pt[] = [{ x: 1, y: 1 }];
  g[1][1] = 0;
  const around = [
    [2, 0],
    [-2, 0],
    [0, 2],
    [0, -2],
  ];
  while (stack.length) {
    const { x, y } = stack[stack.length - 1];
    const opts = around
      .map((d) => d)
      .sort(() => r() - 0.5)
      .filter(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        return nx > 0 && ny > 0 && nx < COLS - 1 && ny < ROWS - 1 && g[ny][nx] === 1;
      });
    if (!opts.length) {
      stack.pop();
      continue;
    }
    const [dx, dy] = opts[0];
    g[y + dy / 2][x + dx / 2] = 0;
    g[y + dy][x + dx] = 0;
    stack.push({ x: x + dx, y: y + dy });
  }
  // Atajos: algunos muros entre dos pasillos se abren para que no haya un único camino.
  for (let n = 0, tries = 0; n < L.loops && tries < 200; tries++) {
    const x = 1 + Math.floor(r() * (COLS - 2));
    const y = 1 + Math.floor(r() * (ROWS - 2));
    if (g[y][x] === 1 && (x % 2) !== (y % 2)) {
      g[y][x] = 0;
      n++;
    }
  }
  const start = { x: 1, y: 1 };
  const goal = { x: COLS - 2, y: ROWS - 2 };

  // Distancias desde la salida para colocar los tomates lejos del inicio.
  const dist = Array.from({ length: ROWS }, () => Array(COLS).fill(-1));
  const q: Pt[] = [start];
  dist[start.y][start.x] = 0;
  for (let k = 0; k < q.length; k++) {
    const { x, y } = q[k];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (g[ny]?.[nx] === 0 && dist[ny][nx] < 0) {
        dist[ny][nx] = dist[y][x] + 1;
        q.push({ x: nx, y: ny });
      }
    }
  }
  const spots = q.filter((p) => dist[p.y][p.x] >= 9 && Math.abs(p.x - goal.x) + Math.abs(p.y - goal.y) >= 3).sort(() => r() - 0.5);
  const tomatoes: Pt[] = [];
  for (const p of spots) {
    if (tomatoes.length >= L.tomatoes) break;
    if (tomatoes.every((t) => Math.abs(t.x - p.x) + Math.abs(t.y - p.y) >= 5)) tomatoes.push(p);
  }
  return { g, start, goal, tomatoes };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const pos = (e: Ent) => ({ x: lerp(e.px, e.x, Math.min(1, e.t)) * T, y: lerp(e.py, e.y, Math.min(1, e.t)) * T });

export default function MazeGame({
  active,
  touch,
  onWin,
}: {
  active: boolean;
  touch: MutableRefObject<Dir | null>;
  onWin: (deaths: number) => void;
}) {
  const cv = useRef<HTMLCanvasElement>(null);
  const [lv, setLv] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const activeRef = useRef(active);
  activeRef.current = active;
  const deaths = useRef(0);
  const levelDeaths = useRef(0); // tomatazos en este nivel: cada uno ralentiza un poco a los tomates (ayuda)
  const keys = useRef<Dir[]>([]);
  const winRef = useRef(onWin);
  winRef.current = onWin;

  // Teclado: flechas o WASD. Gana la última tecla pulsada que siga abajo.
  useEffect(() => {
    const map: Record<string, Dir> = {
      ArrowUp: { dx: 0, dy: -1 }, w: { dx: 0, dy: -1 }, W: { dx: 0, dy: -1 },
      ArrowDown: { dx: 0, dy: 1 }, s: { dx: 0, dy: 1 }, S: { dx: 0, dy: 1 },
      ArrowLeft: { dx: -1, dy: 0 }, a: { dx: -1, dy: 0 }, A: { dx: -1, dy: 0 },
      ArrowRight: { dx: 1, dy: 0 }, d: { dx: 1, dy: 0 }, D: { dx: 1, dy: 0 },
    };
    const down = (e: KeyboardEvent) => {
      if (process.env.NODE_ENV !== "production" && e.key === "9" && activeRef.current) winRef.current(deaths.current); // atajo solo de desarrollo
      const d = map[e.key];
      if (!d || !activeRef.current) return;
      e.preventDefault();
      keys.current = keys.current.filter((k) => k !== d);
      keys.current.push(d);
    };
    const up = (e: KeyboardEvent) => {
      const d = map[e.key];
      if (d) keys.current = keys.current.filter((k) => k !== d);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // Deslizar el dedo sobre la pantalla también mueve a Motoperro.
  useEffect(() => {
    const el = cv.current;
    if (!el) return;
    let sx = 0;
    let sy = 0;
    let on = false;
    const start = (e: PointerEvent) => {
      on = true;
      sx = e.clientX;
      sy = e.clientY;
    };
    const move = (e: PointerEvent) => {
      if (!on) return;
      const dx = e.clientX - sx;
      const dy = e.clientY - sy;
      if (Math.hypot(dx, dy) < 14) return;
      touch.current = Math.abs(dx) > Math.abs(dy) ? { dx: Math.sign(dx), dy: 0 } : { dx: 0, dy: Math.sign(dy) };
      sx = e.clientX;
      sy = e.clientY;
    };
    const end = () => {
      on = false;
      touch.current = null;
    };
    el.addEventListener("pointerdown", start);
    el.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      el.removeEventListener("pointerdown", start);
      el.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [touch]);

  // El juego: un bucle en el ticker de GSAP, dibujando en el canvas.
  useEffect(() => {
    const canvas = cv.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const level = makeLevel(lv);
    const wall = (x: number, y: number) => level.g[y]?.[x] !== 0;
    const mk = (p: Pt): Ent => ({ x: p.x, y: p.y, px: p.x, py: p.y, t: 1, dir: { dx: 0, dy: 0 } });
    let me = mk(level.start);
    let face = 1;
    const toms = level.tomatoes.map((p) => {
      const e = mk(p);
      const open = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }].filter((d) => !wall(p.x + d.dx, p.y + d.dy));
      e.dir = open[Math.floor(Math.random() * open.length)] ?? { dx: 1, dy: 0 };
      return e;
    });
    levelDeaths.current = 0;
    let dead = 0; // ms restantes de la pantalla de "tomatazo"
    let won = false;
    let time = 0;
    ctx.imageSmoothingEnabled = false;

    const step = (e: Ent, d: Dir) => {
      e.px = e.x;
      e.py = e.y;
      e.x += d.dx;
      e.y += d.dy;
      e.t = 0;
    };

    const tomatoStep = (e: Ent) => {
      const opts = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }].filter((d) => !wall(e.x + d.dx, e.y + d.dy));
      const fwd = opts.filter((d) => d.dx === e.dir.dx && d.dy === e.dir.dy);
      const side = opts.filter((d) => !(d.dx === -e.dir.dx && d.dy === -e.dir.dy) && !(d.dx === e.dir.dx && d.dy === e.dir.dy));
      let pick: Dir | undefined;
      if (side.length && (!fwd.length || Math.random() < 0.45)) pick = side[Math.floor(Math.random() * side.length)];
      else if (fwd.length) pick = fwd[0];
      else pick = opts[0];
      if (pick) {
        e.dir = pick;
        step(e, pick);
      }
    };

    const reset = () => {
      me = mk(level.start);
      toms.forEach((t, i) => Object.assign(t, mk(level.tomatoes[i])));
    };

    const px = (c: string, x: number, y: number, w: number, h: number) => {
      ctx.fillStyle = c;
      ctx.fillRect(Math.round(x), Math.round(y), w, h);
    };

    const drawWorld = () => {
      for (let y = 0; y < ROWS; y++)
        for (let x = 0; x < COLS; x++) {
          if (level.g[y][x] === 1) {
            px("#7a3d5c", x * T, y * T, T, T);
            px("#a85d84", x * T, y * T, T, 3);
            px("#5a2a45", x * T, y * T + T - 3, T, 3);
            px("#93507a", x * T + 3, y * T + 6, 4, 3);
          } else {
            px((x + y) % 2 ? "#ffeccf" : "#f7dfb8", x * T, y * T, T, T);
          }
        }
      // Salmón ahumado
      const gx = level.goal.x * T;
      const gy = level.goal.y * T;
      const bob = Math.sin(time / 260) * 1.2;
      px("#ff8a6b", gx + 2, gy + 5 + bob, 9, 6);
      px("#ffb59a", gx + 4, gy + 6 + bob, 5, 2);
      px("#ff8a6b", gx + 11, gy + 4 + bob, 3, 8);
      px("#e0563c", gx + 12, gy + 3 + bob, 2, 2);
      px("#e0563c", gx + 12, gy + 11 + bob, 2, 2);
      px("#2a1329", gx + 3, gy + 7 + bob, 1, 1);
    };

    const drawTomato = (e: Ent) => {
      const { x, y } = pos(e);
      px("#b32d33", x + 3, y + 4, 10, 9);
      px("#e5484d", x + 3, y + 3, 10, 9);
      px("#e5484d", x + 2, y + 5, 12, 6);
      px("#ff8a8f", x + 4, y + 4, 2, 2);
      px("#3dbb7d", x + 6, y + 1, 4, 3);
      px("#3dbb7d", x + 5, y + 2, 6, 1);
      px("#2a1329", x + 5, y + 7, 1, 2);
      px("#2a1329", x + 10, y + 7, 1, 2);
    };

    const drawMe = (e: Ent) => {
      const { x, y } = pos(e);
      const f = face;
      const bx = f > 0 ? x + 2 : x + 4;
      px("#c98a4f", bx, y + 7, 10, 6); // cuerpo
      px("#fff1df", bx + (f > 0 ? 3 : 2), y + 11, 5, 2);
      px("#c98a4f", f > 0 ? x + 1 : x + 13, y + 5, 2, 3); // cola
      px("#c98a4f", f > 0 ? x + 9 : x + 1, y + 3, 6, 7); // cabeza
      px("#fff1df", f > 0 ? x + 12 : x + 1, y + 6, 3, 4); // hocico
      px("#6b3a1e", f > 0 ? x + 8 : x + 7, y + 3, 2, 6); // oreja
      px("#2a1329", f > 0 ? x + 13 : x + 1, y + 7, 1, 1); // nariz
      px("#2a1329", f > 0 ? x + 11 : x + 4, y + 5, 1, 1); // ojo
    };

    const hud = () => {
      px("#2a1329", 0, ROWS * T, W, 16);
      ctx.font = "8px monospace";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffb86b";
      ctx.fillText(`NIVEL ${lv + 1}/${LEVELS.length}`, 6, ROWS * T + 8);
      ctx.fillStyle = "#ff8a8f";
      ctx.fillText(`TOMATAZOS ${deaths.current}`, W - 78, ROWS * T + 8);
    };

    const tick = (_: number, dt: number) => {
      if (!activeRef.current) return;
      const ms = Math.min(dt, 50);
      time += ms;
      if (won) return;

      if (dead > 0) {
        dead -= ms;
        if (dead <= 0) {
          setMsg(null);
          reset();
        }
      } else {
        const want = touch.current ?? keys.current[keys.current.length - 1] ?? null;
        me.t += ms / PLAYER_MS;
        if (me.t >= 1 && want && !wall(me.x + want.dx, me.y + want.dy)) {
          face = want.dx !== 0 ? want.dx : face;
          step(me, want);
        } else if (me.t > 1) me.t = 1;
        for (const t of toms) {
          t.t += ms / (LEVELS[lv].tomatoMs * (1 + 0.12 * Math.min(levelDeaths.current, 5)));
          if (t.t >= 1) tomatoStep(t);
        }
        // Colisión: los tomates y Motoperro comparten el mismo trozo de pasillo.
        const a = pos(me);
        if (toms.some((t) => { const b = pos(t); return Math.abs(a.x - b.x) < 9 && Math.abs(a.y - b.y) < 9; })) {
          deaths.current += 1;
          levelDeaths.current += 1;
          dead = 900;
          sfx.error();
          setMsg("¡Un tomate!");
        }
        if (me.x === level.goal.x && me.y === level.goal.y && me.t >= 0.6) {
          won = true;
          if (lv + 1 < LEVELS.length) {
            sfx.success();
            setMsg(`¡Salmón! Nivel ${lv + 2}`);
            gsap.delayedCall(0.9, () => {
              setMsg(null);
              setLv(lv + 1);
            });
          } else {
            winRef.current(deaths.current);
          }
        }
      }

      drawWorld();
      toms.forEach(drawTomato);
      drawMe(me);
      hud();
      if (dead > 0) {
        ctx.fillStyle = "rgba(229, 72, 77, 0.35)";
        ctx.fillRect(0, 0, W, H);
      }
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [lv, touch]);

  return (
    <div className="mz">
      <canvas ref={cv} width={W} height={H} className="mz-canvas" aria-label="Laberinto: lleva a Motoperro hasta el salmón sin tocar los tomates" role="img" />
      {msg && <p className="mz-msg">{msg}</p>}
    </div>
  );
}
