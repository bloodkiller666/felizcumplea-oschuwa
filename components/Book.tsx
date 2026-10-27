"use client";

import { useRef, useState, type MouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { revealSection } from "@/lib/reveal";
import { burst } from "@/lib/fx";
import { letter, bookInfo } from "@/lib/content";
import Glyph from "./Glyph";
import BookArt from "./BookArt";

const MAX = letter.length; // última "apertura" del libro
const LEAVES = MAX + 1; // la portada + una hoja por párrafo

const isMobile = () => typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches;
// Con el libro cerrado, la portada se centra; abierto, se centra el par de páginas.
const shiftFor = (n: number) => (isMobile() || n > 0 ? 0 : -25);

export default function Book({ onNext }: { onNext: () => void }) {
  const root = useRef<HTMLElement>(null);
  const book = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const pageRef = useRef(0);
  const busy = useRef(false);
  const seen = useRef(new Set<number>());
  const words = useRef<Record<number, Element[]>>({});
  const swipeX = useRef<number | null>(null);
  const swiped = useRef(false);

  const { contextSafe } = useGSAP({ scope: root });

  useGSAP(
    () => {
      revealSection(root.current);
      const q = gsap.utils.selector(root);
      const reduce = prefersReducedMotion();

      q(".leaf").forEach((leaf, i) => gsap.set(leaf, { zIndex: LEAVES - i, rotationY: 0 }));
      gsap.set(book.current, { xPercent: shiftFor(0) });

      if (!reduce) {
        // El texto de cada página se escribe palabra a palabra al llegar a ella.
        q(".page-text").forEach((el) => {
          const n = Number((el as HTMLElement).dataset.spread);
          const split = SplitText.create(el, { type: "words" });
          words.current[n] = split.words;
          gsap.set(split.words, { autoAlpha: 0, y: 14 });
        });
        // Las ilustraciones se dibujan solas.
        gsap.set(q(".art-draw"), { drawSVG: "0%" });

        gsap.from(".book-stage", {
          y: 70,
          autoAlpha: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: { trigger: ".book-stage", start: "top 82%", once: true },
        });
        gsap.to(".book", { y: -8, duration: 3.2, repeat: -1, yoyo: true, ease: "sine.inOut" });
      }
    },
    { scope: root }
  );

  const reveal = contextSafe((n: number) => {
    if (n < 1 || seen.current.has(n)) return;
    seen.current.add(n);
    const w = words.current[n];
    if (w) gsap.to(w, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.035, ease: "power3.out", delay: 0.1 });
    const paths = gsap.utils.toArray<Element>(`[data-art="${n}"] .art-draw`, root.current);
    gsap.to(paths, { drawSVG: "100%", duration: 1.8, stagger: 0.18, ease: "power2.inOut", delay: 0.15 });
  });

  const go = contextSafe((dir: 1 | -1) => {
    const from = pageRef.current;
    const to = from + dir;
    if (busy.current || to < 0 || to > MAX) return;

    const el = book.current;
    const idx = dir === 1 ? from : to; // la hoja que gira
    const leaf = root.current?.querySelector<HTMLElement>(`[data-leaf="${idx}"]`);
    if (!el || !leaf) return;

    busy.current = true;
    pageRef.current = to;
    setPage(to);

    const reduce = prefersReducedMotion();
    const mobile = isMobile();
    const front = leaf.querySelector(".shade-front");
    const back = leaf.querySelector(".shade-back");
    const first = dir === 1 ? front : back;
    const second = dir === 1 ? back : front;
    const d = reduce ? 0.01 : 1.15;

    const tl = gsap.timeline({
      onComplete: () => {
        busy.current = false;
      },
    });

    tl.set(leaf, { zIndex: 100, autoAlpha: 1 })
      .to(el, { xPercent: shiftFor(to), duration: d, ease: "power2.inOut" }, 0)
      .to(leaf, { rotationY: dir === 1 ? -180 : 0, duration: d, ease: "power2.inOut" }, 0)
      .to(leaf, { z: 36, duration: d / 2, yoyo: true, repeat: 1, ease: "sine.inOut" }, 0)
      .fromTo(first, { opacity: 0 }, { opacity: 0.55, duration: d / 2, ease: "sine.in" }, 0)
      .fromTo(second, { opacity: 0.55 }, { opacity: 0, duration: d / 2, ease: "sine.out" }, d / 2)
      .set([front, back], { opacity: 0 }, d)
      .set(leaf, { zIndex: dir === 1 ? idx + 1 : LEAVES - idx }, d);

    if (dir === 1 && mobile) tl.set(leaf, { autoAlpha: 0 }, d);
    if (!reduce) tl.add(() => reveal(to), d * 0.55);

    if (from === 0 && dir === 1 && !reduce) {
      burst(el, mobile ? 0 : el.clientWidth / 2, el.clientHeight / 2, {
        count: 30,
        shape: "star",
        distance: 190,
        delay: 0.45,
      });
    }
  });

  const onDown = (e: ReactPointerEvent) => {
    swipeX.current = e.clientX;
    swiped.current = false;
  };
  const onUp = (e: ReactPointerEvent) => {
    if (swipeX.current === null) return;
    const dx = e.clientX - swipeX.current;
    swipeX.current = null;
    if (Math.abs(dx) > 50) {
      swiped.current = true;
      go(dx < 0 ? 1 : -1);
    }
  };
  const onClick = (e: MouseEvent) => {
    if (swiped.current) {
      swiped.current = false;
      return;
    }
    const el = book.current;
    if (!el) return;
    if (isMobile() || pageRef.current === 0) return go(1);
    const rect = el.getBoundingClientRect();
    go(e.clientX > rect.left + rect.width / 2 ? 1 : -1);
  };

  return (
    <section className="section libro" id="carta" data-ghost="DOLOR" ref={root}>
      <h2 className="section-title">Un libro para ti</h2>
      <p className="lede">Ábrelo con calma. Toca el libro, desliza o usa los botones para pasar las páginas.</p>

      <div className="book-stage" data-nofx onClick={onClick} onPointerDown={onDown} onPointerUp={onUp}>
        <div className="book" ref={book} role="group" aria-label="Libro animado con una carta para ti">
          {Array.from({ length: LEAVES }, (_, i) => (
            <div className="leaf" data-leaf={i} key={i}>
              <div className="face face-front">
                {i === 0 ? (
                  <div className="cover">
                    <Glyph type="paw" className="glyph cover-glyph" />
                    <p className="cover-title">{bookInfo.coverTitle}</p>
                    <p className="cover-sub">{bookInfo.coverSub}</p>
                  </div>
                ) : (
                  <div className="page">
                    <div className="page-inline-art" data-art={i}>
                      <BookArt index={i - 1} />
                    </div>
                    <p className="page-text" data-spread={i}>
                      {letter[i - 1]}
                    </p>
                  </div>
                )}
                <span className="shade shade-front" />
              </div>
              <div className="face face-back">
                {i < MAX && (
                  <div className="page page-art" data-art={i + 1}>
                    <BookArt index={i} />
                    <p className="art-caption">{bookInfo.captions[i]}</p>
                  </div>
                )}
                <span className="shade shade-back" />
              </div>
            </div>
          ))}
          <div className="book-shadow" aria-hidden="true" />
        </div>
      </div>

      <div className="book-controls">
        <button type="button" className="btn btn-quiet" onClick={() => go(-1)} disabled={page === 0}>
          Página anterior
        </button>
        <span className="book-count" aria-live="polite">
          {page === 0 ? "Cubierta" : `${page} de ${MAX}`}
        </span>
        <button type="button" className="btn" onClick={() => (page === MAX ? onNext() : go(1))}>
          {page === 0 ? "Abrir el libro" : page === MAX ? "Seguir al Tarot" : "Pasar la página"}
        </button>
      </div>
    </section>
  );
}
