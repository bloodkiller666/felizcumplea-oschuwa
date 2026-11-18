"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/gsap";
import { burst } from "@/lib/fx";

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Las estrellas son DOS capas de fondo (una baldosa SVG repetida) en vez de decenas de elementos con su propia animación.
function starTile(seed: number, n: number) {
  const rand = mulberry32(seed);
  const dots = Array.from({ length: n }, () => {
    const r = (0.6 + rand() * 1.5).toFixed(2);
    return `<circle cx='${(rand() * 480).toFixed(1)}' cy='${(rand() * 480).toFixed(1)}' r='${r}'/>`;
  }).join("");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='480' height='480' fill='white'>${dots}</svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}
const TILE_A = starTile(2026, 26);
const TILE_B = starTile(1218, 22);

const SPARK_COLORS = ["#ffb86b", "#ff7aa8", "#7c93ff", "#fff1df"];

// Guirnalda de luces cálidas que cuelga del techo; cada foco parpadea con su propio ritmo (solo opacity).
function FairyLights() {
  const bulbs = Array.from({ length: 14 }, (_, i) => i);
  return (
    <div className="fairy">
      <svg viewBox="0 0 1000 60" preserveAspectRatio="none" className="fairy-wire">
        <path d="M0 4 Q 71 52 143 10 T 286 10 T 429 10 T 572 10 T 715 10 T 858 10 T 1000 6" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      {bulbs.map((i) => (
        <i key={i} className="bulb" style={{ left: (i + 0.5) * (100 / 14) + "%", top: (i % 2 ? 26 : 10) + "px", animationDelay: -i * 0.7 + "s" }} />
      ))}
    </div>
  );
}

/*
  Lo que rodea al cuarto: cielo y estrellas (se ven por los bordes), la guirnalda de luces, el grano de la imagen
  y unas chispas al tocar fuera de los aparatos.
*/
export default function Atmosphere() {
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (prefersReducedMotion()) return;
      if ((e.target as Element).closest("[data-nofx], input, textarea, button")) return;
      burst(document.body, e.clientX, e.clientY, { count: 10, shape: "star", distance: 70, colors: SPARK_COLORS });
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);

  return (
    <div aria-hidden="true">
      <div className="sky" />
      <div className="stars">
        <i className="stars-a" style={{ backgroundImage: TILE_A }} />
        <i className="stars-b" style={{ backgroundImage: TILE_B }} />
      </div>
      <FairyLights />
      <div className="grain" />
    </div>
  );
}
