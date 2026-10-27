"use client";

import { useRef, useState, type CSSProperties } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { revealSection } from "@/lib/reveal";
import { burst } from "@/lib/fx";
import { characters, intro, beats, endings, pickEnding, type Tone, type EndingKey } from "@/lib/dialogue";

type Who = "pankoki" | "shura";
type Node =
  | { type: "line"; who: Who; text: string }
  | { type: "choice"; beat: number }
  | { type: "ending"; key: EndingKey };

const line = (who: Who, text: string): Node => ({ type: "line", who, text });
const initialQueue = (): Node[] => [
  ...intro.map((t) => line("pankoki", t)),
  line("pankoki", beats[0].ask),
  { type: "choice", beat: 0 },
];

function Portrait({ who }: { who: Who }) {
  const c = characters[who];
  const [failed, setFailed] = useState(false);
  return (
    <div className={`portrait portrait-${who}`} style={{ "--who": c.color } as CSSProperties}>
      <div className="portrait-img">
        {failed ? (
          <div className="portrait-ph" role="img" aria-label={c.name}>
            <span>{c.name.charAt(0)}</span>
            <small>{c.name}</small>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.src} alt={c.name} onError={() => setFailed(true)} />
        )}
      </div>
    </div>
  );
}

export default function Dialogo() {
  const root = useRef<HTMLElement>(null);
  const typing = useRef<gsap.core.Tween | null>(null);
  const talking = useRef<gsap.core.Tween | null>(null);
  const [started, setStarted] = useState(false);
  const [queue, setQueue] = useState<Node[]>(initialQueue);
  const [tones, setTones] = useState<Tone[]>([]);
  const [typed, setTyped] = useState(false);
  const node = queue[0];

  const { contextSafe } = useGSAP({ scope: root });

  // Entrada de los personajes al llegar a la sección.
  useGSAP(
    () => {
      revealSection(root.current);
      const trigger = { trigger: ".vn", start: "top 78%", once: true };
      gsap.from(".portrait-pankoki", { xPercent: -40, autoAlpha: 0, duration: 1, ease: "power3.out", scrollTrigger: trigger });
      gsap.from(".portrait-shura", { xPercent: 40, autoAlpha: 0, duration: 1, delay: 0.15, ease: "power3.out", scrollTrigger: trigger });
      gsap.from(".vn-start > *", { autoAlpha: 0, y: 20, stagger: 0.12, duration: 0.8, delay: 0.5, ease: "power3.out", scrollTrigger: trigger });
    },
    { scope: root }
  );

  // Cada nodo nuevo: resaltar a quien habla y escribir su texto letra a letra.
  useGSAP(
    () => {
      if (!started) return;
      const n = queue[0];
      const q = gsap.utils.selector(root);
      typing.current?.kill();
      talking.current?.kill();

      const speaker: Who = n.type === "line" ? n.who : "shura";
      const other: Who = speaker === "shura" ? "pankoki" : "shura";
      gsap.to(q(`.portrait-${speaker}`), { y: 0, scale: 1.04, filter: "brightness(1)", duration: 0.4, ease: "power2.out" });
      gsap.to(q(`.portrait-${other}`), { y: 14, scale: 0.95, filter: "brightness(0.5)", duration: 0.4, ease: "power2.out" });
      gsap.set(q(".portrait-img"), { y: 0 });

      if (n.type === "line") {
        const el = q(".vn-text")[0];
        if (!el) return;
        el.textContent = "";
        setTyped(false);
        const bob = q(`.portrait-${speaker} .portrait-img`);
        talking.current = gsap.to(bob, { y: -7, duration: 0.17, yoyo: true, repeat: -1, ease: "sine.inOut" });
        typing.current = gsap.to(el, {
          text: { value: n.text, delimiter: "" },
          duration: Math.min(3.2, Math.max(0.8, n.text.length * 0.03)),
          ease: "none",
          onComplete: () => {
            setTyped(true);
            talking.current?.kill();
            gsap.to(bob, { y: 0, duration: 0.2 });
          },
        });
      } else if (n.type === "choice") {
        gsap.from(q(".vn-option"), { autoAlpha: 0, y: 24, scale: 0.96, stagger: 0.12, duration: 0.6, delay: 0.2, ease: "back.out(1.6)" });
      } else {
        gsap.from(q(".ending-card"), { autoAlpha: 0, y: 30, scale: 0.95, duration: 0.9, ease: "power3.out" });
        const host = q(".vn")[0] as HTMLElement | undefined;
        if (host) burst(host, host.clientWidth / 2, host.clientHeight / 2, { count: 40, shape: "star", distance: 260 });
      }
    },
    { dependencies: [queue, started], scope: root }
  );

  const start = contextSafe(() => {
    gsap.to(".vn-start", { autoAlpha: 0, duration: 0.5, onComplete: () => setStarted(true) });
  });

  const advance = contextSafe(() => {
    if (!node || node.type !== "line") return;
    if (typing.current && typing.current.progress() < 1) {
      typing.current.progress(1);
      return;
    }
    setQueue((q) => q.slice(1));
  });

  const choose = contextSafe((beat: number, i: number) => {
    const o = beats[beat].options[i];
    const nextTones = [...tones, o.tone];
    setTones(nextTones);

    const follow: Node[] = [line("shura", o.say), line("pankoki", o.reply)];
    if (beat + 1 < beats.length) {
      follow.push(line("pankoki", beats[beat + 1].ask), { type: "choice", beat: beat + 1 });
    } else {
      const key = pickEnding(nextTones);
      endings[key].lines.forEach((t) => follow.push(line("pankoki", t)));
      follow.push({ type: "ending", key });
    }
    setQueue(follow);
  });

  const again = contextSafe(() => {
    setTones([]);
    setQueue(initialQueue());
  });

  const who = node.type === "line" ? node.who : "shura";

  return (
    <section className="section dialogo" id="platica" data-ghost="HABLAR" ref={root}>
      <h2 className="section-title">Una plática con Pankoki</h2>
      <p className="lede">Ahora te toca a ti hablar. Elige qué responder: tus decisiones cambian cómo termina la plática.</p>

      <div className="vn" data-nofx>
        <div className="vn-floor" aria-hidden="true" />
        <div className="vn-cast">
          <Portrait who="pankoki" />
          <Portrait who="shura" />
        </div>

        {!started && (
          <div className="vn-start">
            <p>Pankoki quiere hablar contigo.</p>
            <button type="button" className="btn" onClick={start}>
              Escuchar a Pankoki
            </button>
          </div>
        )}

        {started && node.type !== "ending" && (
          <div
            className="vn-box"
            style={{ "--who": characters[who].color } as CSSProperties}
            onClick={node.type === "line" ? advance : undefined}
          >
            <span className="vn-name">{characters[who].name}</span>

            {node.type === "line" && (
              <>
                <p className="vn-text" aria-hidden="true" />
                <p className="sr-only" aria-live="polite">{node.text}</p>
                <button
                  type="button"
                  className="vn-next"
                  onClick={(e) => {
                    e.stopPropagation();
                    advance();
                  }}
                >
                  {typed ? "Continuar ▸" : "Saltar ▸▸"}
                </button>
              </>
            )}

            {node.type === "choice" && (
              <>
                <p className="vn-question">{beats[node.beat].ask}</p>
                <div className="vn-options" role="group" aria-label="Elige tu respuesta">
                  {beats[node.beat].options.map((o, i) => (
                    <button type="button" className="vn-option" key={o.say} onClick={() => choose(node.beat, i)}>
                      {o.say}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="vn-dots" aria-hidden="true">
              {beats.map((_, i) => (
                <i key={i} className={tones.length > i ? "on" : ""} />
              ))}
            </div>
          </div>
        )}

        {node.type === "ending" && (
          <div className="ending-card">
            <p className="ending-kicker">{endings[node.key].title}</p>
            <p className="ending-text">{endings[node.key].reflection}</p>
            <button type="button" className="btn btn-quiet" onClick={again}>
              Conversar de nuevo
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
