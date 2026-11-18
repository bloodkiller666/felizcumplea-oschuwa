import type { GlyphKey } from "@/lib/tarot";

/** Un glifo = una referencia al sprite (ver Sprites.tsx). El trazo y el color vienen de CSS (currentColor). */
export default function Glyph({ type, className = "glyph" }: { type: GlyphKey; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <use href={`#g-${type}`} />
    </svg>
  );
}
