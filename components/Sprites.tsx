import type { ReactNode } from "react";
import type { GlyphKey } from "@/lib/tarot";

const shapes: Record<GlyphKey, ReactNode> = {
  paw: (
    <>
      <path d="M50 80c-14 0-22-8-22-16 0-9 10-16 22-16s22 7 22 16c0 8-8 16-22 16z" />
      <circle cx="24" cy="42" r="7" />
      <circle cx="40" cy="28" r="7" />
      <circle cx="60" cy="28" r="7" />
      <circle cx="76" cy="42" r="7" />
    </>
  ),
  bat: (
    <g transform="rotate(35 50 50)">
      <path d="M43 10Q50 4 57 10L58 44Q57 60 53 66L52.5 86Q53 92 50 93Q47 92 47.5 86L47 66Q43 60 42 44Z" />
    </g>
  ),
  lighthouse: (
    <>
      <path d="M42 90L46 36H54L58 90Z" />
      <path d="M44 36L50 22L56 36" />
      <path d="M30 28L16 22M70 28L84 22M30 40L14 42M70 40L86 42" />
      <path d="M36 90H64" />
    </>
  ),
  spark: <path d="M50 12Q54 46 88 50Q54 54 50 88Q46 54 12 50Q46 46 50 12Z" />,
  star: <path d="M50 12L60 38L88 40L66 58L74 86L50 70L26 86L34 58L12 40L40 38Z" />,
  sun: (
    <>
      <circle cx="50" cy="50" r="16" />
      <path d="M50 14V26M50 74V86M14 50H26M74 50H86M24 24L33 33M67 67L76 76M76 24L67 33M33 67L24 76" />
    </>
  ),
  moon: <path d="M64 18A34 34 0 1 0 82 66A28 28 0 0 1 64 18Z" />,
  road: (
    <>
      <path d="M38 90L46 12M62 90L54 12" />
      <path d="M50 82V70M50 58V46M50 34V22" />
    </>
  ),
  home: (
    <>
      <path d="M16 48L50 18L84 48" />
      <path d="M26 44V84H74V44" />
      <path d="M44 84V62H56V84" />
    </>
  ),
  vessel: (
    <>
      <path d="M30 22H70L74 50Q74 82 50 86Q26 82 26 50Z" />
      <path d="M50 24L44 42L56 54L48 70" />
    </>
  ),
  table: (
    <>
      <path d="M12 44H88" />
      <path d="M22 44V86M78 44V86" />
      <circle cx="30" cy="28" r="7" />
      <circle cx="50" cy="24" r="7" />
      <circle cx="70" cy="28" r="7" />
    </>
  ),
  wheel: (
    <>
      <circle cx="50" cy="50" r="34" />
      <circle cx="50" cy="50" r="6" />
      <path d="M50 16V44M50 56V84M16 50H44M56 50H84M26 26L45 45M55 55L74 74M74 26L55 45M45 55L26 74" />
    </>
  ),
  door: (
    <>
      <path d="M26 88V18H74V88" />
      <path d="M26 18L58 28V84L26 88" />
      <circle cx="52" cy="56" r="2.5" />
    </>
  ),
  sunrise: (
    <>
      <path d="M12 70H88" />
      <path d="M26 70A24 24 0 0 1 74 70" />
      <path d="M50 22V34M20 38L28 46M80 38L72 46" />
      <path d="M24 82H76" />
    </>
  ),
};

/**
 * Sprite SVG: cada glifo se dibuja UNA vez aquí y el resto de la página lo referencia con <use>.
 * Antes cada carta, cubierta y huella repetía sus propios <path>; ahora el DOM guarda una sola copia.
 */
export default function Sprites() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        {(Object.keys(shapes) as GlyphKey[]).map((k) => (
          <symbol id={`g-${k}`} viewBox="0 0 100 100" key={k}>
            {shapes[k]}
          </symbol>
        ))}
        <symbol id="g-pawprint" viewBox="0 0 40 46">
          <g fill="currentColor" stroke="none">
            <ellipse cx="20" cy="32" rx="11" ry="9" />
            <ellipse cx="7" cy="20" rx="4.2" ry="5.5" transform="rotate(-18 7 20)" />
            <ellipse cx="16" cy="11" rx="4.2" ry="5.8" />
            <ellipse cx="24" cy="11" rx="4.2" ry="5.8" />
            <ellipse cx="33" cy="20" rx="4.2" ry="5.5" transform="rotate(18 33 20)" />
          </g>
        </symbol>
      </defs>
    </svg>
  );
}
