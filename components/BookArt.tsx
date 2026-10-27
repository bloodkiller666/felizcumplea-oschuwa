import type { ReactNode } from "react";

// Cuatro ilustraciones de trazo (viewBox 100x100). Cada <path className="art-draw"> se "dibuja" con DrawSVG.
const arts: ReactNode[] = [
  // 0 · luna y estrellas
  <>
    <path className="art-draw" d="M64 14A36 36 0 1 0 84 66A30 30 0 0 1 64 14Z" />
    <path className="art-draw accent" d="M22 22L24 28L30 30L24 32L22 38L20 32L14 30L20 28Z" />
    <path className="art-draw accent" d="M82 40L83.5 44L88 45.5L83.5 47L82 51L80.5 47L76 45.5L80.5 44Z" />
    <path className="art-draw" d="M10 90Q50 78 90 90" />
  </>,
  // 1 · nube con lluvia y sol asomando
  <>
    <path className="art-draw" d="M26 64Q14 64 14 54Q14 44 26 44Q28 32 44 32Q56 32 60 43Q74 41 76 54Q78 64 66 64Z" />
    <path className="art-draw accent" d="M84 22A10 10 0 1 1 64 22A10 10 0 1 1 84 22Z" />
    <path className="art-draw accent" d="M74 4V8M90 22H86M88 8L85 11M60 8L63 11" />
    <path className="art-draw" d="M30 72L27 84M44 72L41 84M58 72L55 84" />
  </>,
  // 2 · huella de pantera
  <>
    <path className="art-draw" d="M50 80C36 80 28 72 28 64C28 55 38 48 50 48C62 48 72 55 72 64C72 72 64 80 50 80Z" />
    <path className="art-draw accent" d="M31 40A7 7 0 1 1 17 40A7 7 0 1 1 31 40Z" />
    <path className="art-draw accent" d="M47 26A7 7 0 1 1 33 26A7 7 0 1 1 47 26Z" />
    <path className="art-draw accent" d="M67 26A7 7 0 1 1 53 26A7 7 0 1 1 67 26Z" />
    <path className="art-draw accent" d="M83 40A7 7 0 1 1 69 40A7 7 0 1 1 83 40Z" />
  </>,
  // 3 · refugio al amanecer
  <>
    <path className="art-draw" d="M24 58L50 36L76 58" />
    <path className="art-draw" d="M30 54V84H70V54" />
    <path className="art-draw" d="M44 84V66H56V84" />
    <path className="art-draw accent" d="M34 36A18 18 0 0 1 66 36" />
    <path className="art-draw accent" d="M50 10V16M22 20L26 24M78 20L74 24" />
    <path className="art-draw" d="M8 84H92" />
  </>,
];

export default function BookArt({ index }: { index: number }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
      {arts[index]}
    </svg>
  );
}
