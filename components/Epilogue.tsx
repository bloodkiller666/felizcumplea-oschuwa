"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { burst, fireworks } from "@/lib/fx";
import { epilogue } from "@/lib/content";

// ✏️ Fecha de la cuenta regresiva: 18 de diciembre de 2027 (hora local, 00:00).
const TARGET = new Date(2027, 11, 18, 0, 0, 0).getTime();

const parts = (ms: number) => {
  const total = Math.floor(ms / 1000);
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
};
const two = (n: number) => String(n).padStart(2, "0");

export default function Epilogue() {
  const root = useRef<HTMLElement>(null);
  const [left, setLeft] = useState(() => Math.max(0, TARGET - Date.now()));
  const p = parts(left);

  useEffect(() => {
    const id = setInterval(() => setLeft(Math.max(0, TARGET - Date.now())), 1000);
    return () => clearInterval(id);
  }, []);

  useGSAP(
    () => {
      const split = SplitText.create(".ep-title", { type: "chars,words", mask: "chars" });
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".ep-panel", { autoAlpha: 0, y: 40, scale: 0.97, duration: 1.2 })
        .from(".onair", { autoAlpha: 0, y: -12, duration: 0.6 }, 0.5)
        .from(split.chars, { yPercent: 115, stagger: 0.03, duration: 0.9, ease: "power4.out" }, 0.7)
        .from(".ep-text", { autoAlpha: 0, y: 20, duration: 0.9 }, 1.5)
        .from(".ep-caption", { autoAlpha: 0, duration: 0.8 }, 2.1)
        .from(".cd-cell", { autoAlpha: 0, rotationX: -90, transformOrigin: "50% 0%", stagger: 0.12, duration: 0.8, ease: "back.out(1.6)" }, 2.2)
        .from(".ep-end", { autoAlpha: 0, y: 14, duration: 0.9 }, 3.1)
        // El "EN VIVO" se apaga: se acabó el programa.
        .to(".onair-dot", { backgroundColor: "#8d8fd0", boxShadow: "0 0 0 0 rgba(0,0,0,0)", duration: 0.6 }, 3.6)
        .to(".onair-label", { duration: 1.2, scrambleText: { text: "FIN DEL PROGRAMA", chars: "upperCase", speed: 0.5 } }, 3.6);

      const panel = root.current?.querySelector<HTMLElement>(".ep-panel");
      fireworks(3200);
      if (panel) burst(panel, panel.clientWidth / 2, 40, { count: 36, shape: "star", distance: 280, delay: 0.9 });
    },
    { scope: root }
  );

  // Tic-tac de los segundos.
  useGSAP(
    () => {
      gsap.fromTo(".cd-s .cd-num", { yPercent: -35, autoAlpha: 0.2 }, { yPercent: 0, autoAlpha: 1, duration: 0.4, ease: "power3.out" });
    },
    { dependencies: [p.s], scope: root }
  );

  const cells: [string, string, string][] = [
    ["cd-d", String(p.d).padStart(3, "0"), "días"],
    ["cd-h", two(p.h), "horas"],
    ["cd-m", two(p.m), "minutos"],
    ["cd-s", two(p.s), "segundos"],
  ];

  return (
    <section className="epilogue" id="despedida" ref={root}>
      <div className="ep-panel">
        <p className="onair">
          <i className="onair-dot" />
          <span className="onair-label">EN VIVO</span>
        </p>
        <h2 className="ep-title">{epilogue.title}</h2>
        <p className="ep-text">{epilogue.text}</p>
        <p className="ep-caption">{epilogue.caption}</p>
        <div className="countdown" role="timer" aria-label={epilogue.caption}>
          {cells.map(([cls, num, label]) => (
            <div className={`cd-cell ${cls}`} key={cls}>
              <span className="cd-num">{num}</span>
              <span className="cd-label">{label}</span>
            </div>
          ))}
        </div>
        <p className="ep-end">{epilogue.end}</p>
      </div>
    </section>
  );
}
