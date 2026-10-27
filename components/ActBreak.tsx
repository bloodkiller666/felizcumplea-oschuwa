"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { fireworks, starCannon } from "@/lib/fx";
import { acts } from "@/lib/content";

type Act = (typeof acts)[number];

// Fragmento roto que se convierte en estrella (MorphSVG): la resurrección en una sola forma.
const SHARD = "M60 4L74 42L58 50L84 84L52 68L42 98L38 64L8 54L42 42Z";
const STAR = "M60 4L74 42L116 46L84 72L94 112L60 90L26 112L36 72L4 46L46 42Z";
const RAYS = Array.from({ length: 14 }, (_, i) => i * (360 / 14));

function Shape({ act }: { act: Act }) {
  return (
    <svg className="act-shape" viewBox="0 0 120 120" aria-hidden="true">
      {act.n === 1 && (
        <g className="act-crack">
          <path className="act-draw" d={SHARD} />
          <path className="act-draw" d="M60 4L56 30L66 52L54 74L62 98" />
          <path className="act-draw" d="M8 54L36 56L52 68" />
        </g>
      )}
      {act.n === 2 &&
        [14, 30, 46].map((r) => <circle key={r} className="act-ring" cx="60" cy="60" r={r} />)}
      {act.n === 3 && (
        <>
          <path className="act-morph" d={SHARD} />
        </>
      )}
      {act.n === 4 && (
        <>
          <g className="act-rays">
            {RAYS.map((a) => (
              <line key={a} x1="60" y1="8" x2="60" y2="22" transform={`rotate(${a} 60 60)`} />
            ))}
          </g>
          <circle className="act-sun" cx="60" cy="60" r="26" />
        </>
      )}
    </svg>
  );
}

/**
 * Separador de acto a pantalla completa. Cada acto tiene su propio lenguaje de movimiento:
 *  I dolor (glitch + latido, se reproduce solo) · II reflexión (desenfoque que se aclara, ondas)
 *  III resurrección (sube con "rise", el fragmento se vuelve estrella) · IV futuro (sol, rayos, estallido).
 */
export default function ActBreak({ act }: { act: Act }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      const split = SplitText.create(q(".act-title")[0], { type: "chars", mask: "chars", charsClass: "achar" });
      const chars = split.chars;
      const pinned = act.n > 1;

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        paused: !pinned,
        scrollTrigger: pinned
          ? {
              trigger: root.current,
              start: "top top",
              end: "+=150%",
              pin: true,
              scrub: 0.7,
              anticipatePin: 1,
              onEnter: () => (act.n === 3 ? fireworks(2400) : act.n === 4 ? starCannon(0.5, 0.55) : undefined),
            }
          : undefined,
      });

      if (!pinned) {
        // El dolor no se desliza: aparece de golpe, después de la transición del zarpazo.
        gsap.delayedCall(1.2, () => tl.play());
      }

      // Telón de color propio de cada acto.
      const curtainFrom = [
        "",
        "inset(0% 50% 0% 50%)",
        "circle(0% at 50% 50%)",
        "inset(100% 0% 0% 0%)",
        "circle(0% at 50% 100%)",
      ][act.n];
      const curtainTo = ["", "inset(0% 0% 0% 0%)", "circle(80% at 50% 50%)", "inset(0% 0% 0% 0%)", "circle(150% at 50% 100%)"][act.n];
      tl.fromTo(q(".act-curtain"), { clipPath: curtainFrom }, { clipPath: curtainTo, duration: 1.4, ease: "power2.inOut" }, 0)
        .from(q(".act-roman"), { autoAlpha: 0, scale: act.n === 4 ? 0.2 : 2.6, rotate: act.n === 1 ? -10 : 0, duration: 1, ease: "back.out(1.4)" }, 0.3)
        .from(q(".act-kicker"), { autoAlpha: 0, letterSpacing: "1.2em", duration: 1 }, 0.4);

      if (act.n === 1) {
        tl.from(chars, { yPercent: 130, skewX: 22, autoAlpha: 0, stagger: 0.06, duration: 0.7 }, 0.6)
          .from(q(".act-draw"), { drawSVG: "0%", duration: 1.4, stagger: 0.25, ease: "power2.inOut" }, 0.9)
          .to(q(".act-shape"), { scale: 1.08, duration: 1.1, ease: "heartbeat", repeat: 3, transformOrigin: "50% 50%" }, 1.2)
          // Glitch: las letras tiemblan como una señal que se corta.
          .to(chars, { x: "random(-7,7)", skewX: "random(-12,12)", duration: 0.06, repeat: 9, repeatRefresh: true, ease: "none" }, 1.5)
          .to(chars, { x: 0, skewX: 0, duration: 0.15 }, 2.2);
      }

      if (act.n === 2) {
        tl.from(chars, { autoAlpha: 0, yPercent: 60, filter: "blur(20px)", stagger: 0.07, duration: 1.2 }, 0.6)
          .from(q(".act-ring"), { scale: 0, autoAlpha: 0, transformOrigin: "50% 50%", stagger: 0.3, duration: 1.6, ease: "power2.out" }, 0.8)
          .to(q(".act-ring"), { scale: 1.5, autoAlpha: 0.15, transformOrigin: "50% 50%", stagger: 0.3, duration: 1.8, ease: "sine.inOut" }, 2.2);
      }

      if (act.n === 3) {
        tl.from(chars, { yPercent: 170, autoAlpha: 0, stagger: 0.05, duration: 1.1, ease: "rise" }, 0.6)
          .to(q(".act-morph"), { morphSVG: STAR, duration: 1.6, ease: "power2.inOut" }, 1.1)
          .to(q(".act-shape"), { rotation: 216, scale: 1.2, transformOrigin: "50% 50%", duration: 1.6, ease: "power2.inOut" }, 1.1)
          .fromTo(q(".act-morph"), { fillOpacity: 0 }, { fillOpacity: 1, duration: 0.8 }, 1.9);
      }

      if (act.n === 4) {
        tl.from(chars, { scale: 3.2, autoAlpha: 0, stagger: { each: 0.06, from: "center" }, duration: 1, transformOrigin: "50% 50%" }, 0.6)
          .from(q(".act-sun"), { scale: 0, transformOrigin: "50% 50%", duration: 1.2, ease: "back.out(1.6)" }, 0.5)
          .from(q(".act-rays line"), { autoAlpha: 0, scaleY: 0, transformOrigin: "50% 100%", stagger: 0.04, duration: 0.7 }, 1.1)
          .to(q(".act-rays"), { rotation: 120, transformOrigin: "50% 50%", duration: 3.5, ease: "none" }, 0.5);
      }

      tl.from(q(".act-sub"), { autoAlpha: 0, y: 28, duration: 1 }, 1.4)
        .from(q(".act-hint"), { autoAlpha: 0, y: 12, duration: 0.6 }, 2)
        .fromTo(q(".act-row-a"), { xPercent: 0 }, { xPercent: -30, ease: "none", duration: 4.4 }, 0)
        .fromTo(q(".act-row-b"), { xPercent: -30 }, { xPercent: 0, ease: "none", duration: 4.4 }, 0);

      gsap.to(q(".act-hint i"), { y: 8, duration: 0.7, yoyo: true, repeat: -1, ease: "sine.inOut" });
    },
    { scope: root }
  );

  const band = `${act.marquee} `.repeat(6);

  return (
    <section className="act" id={act.id} data-actn={act.n} ref={root}>
      <div className="act-curtain" aria-hidden="true" />
      <div className="act-marquee" aria-hidden="true">
        <p className="act-row act-row-a">{band}</p>
        <p className="act-row act-row-b">{band}</p>
      </div>
      <div className="act-inner">
        <p className="act-kicker">Acto <span className="act-roman">{act.roman}</span></p>
        <Shape act={act} />
        <h2 className="act-title">{act.title}</h2>
        <p className="act-sub">{act.sub}</p>
        <p className="act-hint" aria-hidden="true">
          Sigue bajando <i>↓</i>
        </p>
      </div>
    </section>
  );
}
