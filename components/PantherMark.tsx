"use client";

import { useState } from "react";

/**
 * Si existe /public/shurahiwa.png (o la ruta de `src`) se muestra su avatar real.
 * Si no, se dibuja una pantera biker con bate como emblema.
 */
export default function PantherMark({ src, label }: { src?: string; label: string }) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="panther-img" src={src} alt={label} onError={() => setFailed(true)} />;
  }

  return (
    <svg className="panther-svg" viewBox="0 0 260 240" role="img" aria-label={label}>
      <defs>
        <radialGradient id="pm-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff4fa3" stopOpacity=".45" />
          <stop offset="100%" stopColor="#ff4fa3" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pm-wood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ff9fd6" />
          <stop offset="1" stopColor="#5b7cff" />
        </linearGradient>
        <linearGradient id="pm-fur" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2f9a" />
          <stop offset="1" stopColor="#0a0822" />
        </linearGradient>
      </defs>

      <circle cx="125" cy="120" r="120" fill="url(#pm-halo)" />

      {/* bate, asomando por detrás */}
      <g transform="translate(176 150) rotate(32)">
        <g className="bat">
          <path
            d="M-9 -100Q0 -108 9 -100L10 -50Q9 -20 4 0L3 52Q4 60 0 62Q-4 60 -3 52L-4 0Q-9 -20 -10 -50Z"
            fill="url(#pm-wood)"
            stroke="#1a1a5e"
            strokeWidth="2"
          />
          <path d="M-3.5 20L3.5 20M-3.4 28L3.4 28M-3.3 36L3.3 36" stroke="#1a1a5e" strokeWidth="3" strokeLinecap="round" />
        </g>
      </g>

      {/* orejas */}
      <path d="M52 82L64 22L106 58Z" fill="#080620" stroke="#a99bff" strokeOpacity=".5" strokeWidth="2" strokeLinejoin="round" />
      <path d="M188 82L176 22L134 58Z" fill="#080620" stroke="#a99bff" strokeOpacity=".5" strokeWidth="2" strokeLinejoin="round" />
      <path d="M66 38L72 66L92 56Z" fill="#ff4fa3" />
      <path d="M174 38L168 66L148 56Z" fill="#ff4fa3" />

      {/* cabeza */}
      <path
        d="M50 98C50 62 84 46 120 46C156 46 190 62 190 98C190 152 160 198 120 198C80 198 50 152 50 98Z"
        fill="url(#pm-fur)"
        stroke="#a99bff"
        strokeOpacity=".55"
        strokeWidth="2"
      />

      {/* mechón rosa */}
      <path d="M96 50Q104 78 92 110Q112 84 118 48Z" fill="#ff4fa3" opacity=".9" />
      <path d="M144 50Q136 78 148 110Q128 84 122 48Z" fill="#5b7cff" opacity=".9" />

      {/* bandana de biker */}
      <path d="M54 92Q120 62 186 92" stroke="#ff4fa3" strokeWidth="10" strokeLinecap="round" fill="none" />
      <path d="M186 92L206 84M186 92L204 102" stroke="#ff4fa3" strokeWidth="7" strokeLinecap="round" />

      {/* ojos */}
      <g className="eye">
        <path d="M76 112Q96 96 114 114Q96 124 76 112Z" fill="#e5174f" />
        <ellipse cx="96" cy="111" rx="3.5" ry="8" fill="#080620" /><circle cx="99" cy="108" r="2" fill="#fff" />
      </g>
      <g className="eye">
        <path d="M164 112Q144 96 126 114Q144 124 164 112Z" fill="#e5174f" />
        <ellipse cx="144" cy="111" rx="3.5" ry="8" fill="#080620" /><circle cx="147" cy="108" r="2" fill="#fff" />
      </g>

      {/* hocico */}
      <path d="M106 150Q120 142 134 150Q128 164 120 166Q112 164 106 150Z" fill="#ff4fa3" />
      <path d="M120 166V174M108 180Q120 186 132 180" stroke="#a99bff" strokeOpacity=".7" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M90 152L46 144M90 160L48 164M150 152L194 144M150 160L192 164" stroke="#a99bff" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
