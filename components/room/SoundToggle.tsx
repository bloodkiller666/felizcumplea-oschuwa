"use client";

import { useEffect, useState } from "react";
import { audioReady, isMuted, setMuted, subscribeAudio } from "@/lib/sfx";

/* Botón de sonido (esquina inferior derecha). Aparece cuando el audio ya se activó con "Entrar al cuarto". */
export default function SoundToggle() {
  const [, force] = useState(0);
  useEffect(() => subscribeAudio(() => force((n) => n + 1)), []);
  if (!audioReady()) return null;
  const muted = isMuted();
  return (
    <button type="button" className="sound-toggle" onClick={() => setMuted(!muted)} aria-pressed={!muted} aria-label={muted ? "Activar sonido" : "Silenciar sonido"} data-nofx>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 9v6h4l5 4V5L8 9H4Z" />
        {muted ? <path d="M17 9l5 6M22 9l-5 6" /> : <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />}
      </svg>
    </button>
  );
}
